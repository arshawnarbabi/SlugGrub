// Owner: Ethan. Ask SlugGrub: takes a question, returns up to 3 dishes from the meal each dining hall is serving now (or next
// today). Gemini runs here only; the key never reaches the browser.
//
// Gemini only PICKS: dish ids are an enum of this meal's real dishes (no condiments, drinks, sauces or bars), so it cannot invent
// one, and the calories and protein shown always come from the UCSC labels, never from Gemini. Questions are capped at
// ASK_MAX_CHARS and each address gets a few questions per window, so outsiders can't run up the bill.
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { getAllMenus } from "@/lib/menus";
import { HALLS, hallHoursOn, mealNow } from "@/lib/halls";
import { isDrink, isRealDish } from "@/lib/dishKinds";
import { addDays, campusClock, clockLabel } from "@/lib/campusTime";
import type { Dish, HallId, MealName } from "@/lib/types";
import { ASK_MAX_CHARS, type AskError, type AskErrorCode, type AskPick, type AskResult } from "./contract";

const MODEL = "gemini-3.8-flash";
const PER_IP = { max: 8, windowMs: 10 * 60_000 }; // 8 questions per 10 minutes per address
const GLOBAL = { max: 120, windowMs: 60 * 60_000 }; // and 120 an hour per server instance, whoever asks
const MAX_DISHES_PER_HALL = 45;

const hits = new Map<string, number[]>();
function limited(key: string, rule: { max: number; windowMs: number }, now: number): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < rule.windowMs);
  if (recent.length >= rule.max) { hits.set(key, recent); return true; }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < rule.windowMs)) hits.delete(k);
  return false;
}

function fail(error: AskErrorCode, message: string, status: number) {
  return Response.json({ ok: false, error, message } satisfies AskError, { status });
}

interface Candidate { key: string; dish: Dish; hallId: HallId; hallShort: string; colleges: string; meal: MealName; open: boolean; when: string }

/** Each hall's meal now (or next today), real dishes only. After the last meal of the night, tomorrow's first meal. */
async function candidates(now: Date) {
  const clock = campusClock(now);
  for (const [date, minutes, tomorrow] of [[clock.date, clock.minutes, false], [addDays(clock.date, 1), 0, true]] as const) {
    const menus = await getAllMenus(date);
    const out: Candidate[] = [];
    for (const hall of HALLS) {
      const status = mealNow(hall.id, date, minutes);
      if (!status.meal) continue;
      const opens = hallHoursOn(hall.id, date).find((h) => h.meal === status.meal)?.open;
      const when = tomorrow && opens ? `tomorrow at ${clockLabel(opens)}` : status.text;
      const seen = new Set<string>();
      for (const dish of menus.find((m) => m.hallId === hall.id)?.meals[status.meal] ?? []) {
        if (!isRealDish(dish) || isDrink(dish) || seen.has(dish.name)) continue;
        seen.add(dish.name);
        if (seen.size > MAX_DISHES_PER_HALL) break;
        out.push({ key: `${hall.id}-${dish.recipeId}`, dish, hallId: hall.id, hallShort: hall.short, colleges: hall.colleges.join(" and "), meal: status.meal, open: status.open, when });
      }
    }
    if (out.length) return { list: out, menuDate: menus[0]?.date ?? date, fallback: !!menus[0]?.fallbackFor, tomorrow };
  }
  return null;
}

function promptFor(question: string, list: Candidate[], tomorrow: boolean) {
  const lines = list.map((c) => {
    const n = c.dish.nutrition;
    const facts = [
      n ? `${n.calories} cal` : "no label",
      n?.proteinG !== undefined ? `${n.proteinG}g protein` : "",
      n?.carbsG !== undefined ? `${n.carbsG}g carbs` : "",
      n?.fatG !== undefined ? `${n.fatG}g fat` : "",
      c.dish.portion ? `per ${c.dish.portion}` : "",
      c.dish.tags?.join(", ") ?? "",
      c.dish.allergens ? `contains ${c.dish.allergens}` : "",
    ].filter(Boolean).join("; ");
    return `- ${c.key}: ${c.dish.name} [${c.dish.category}] at ${c.hallShort} (serves ${c.colleges}), ${c.meal}, ${c.when} | ${facts}`;
  }).join("\n");
  return `You help UC Santa Cruz students choose what to eat at the dining halls ${tomorrow ? "tomorrow morning" : "right now"}.
Each hall is named after the colleges it serves, so "near Porter" means Porter/Kresge, "near Nine" means JRL/C9, and so on.
Prefer halls that are open now over ones opening later.

The dishes being served (the ONLY dishes you may pick, by id; numbers are per official portion from the UCSC label):
${lines}

The student asks: """${question}"""

Pick up to 3 dishes that best fit the question. Respect calorie, protein and diet limits using the numbers given (a student may eat more than one portion, say so in the reason if you assume that). If nothing fits, return no picks and say why in the answer.
"answer": one or two short, friendly sentences. "reason": a few words per pick. Never invent dishes, numbers or halls.`;
}

function schemaFor(keys: string[]) {
  return {
    type: "object",
    properties: {
      answer: { type: "string" },
      picks: {
        type: "array",
        maxItems: 3,
        items: {
          type: "object",
          properties: { id: { type: "string", enum: keys }, reason: { type: "string" } },
          required: ["id", "reason"],
        },
      },
    },
    required: ["answer", "picks"],
  };
}

export async function POST(req: Request) {
  let question = "";
  try {
    const body = (await req.json()) as { question?: unknown };
    question = typeof body?.question === "string" ? body.question.replace(/\s+/g, " ").trim() : "";
  } catch {
    return fail("bad_request", "Send the question as JSON.", 400);
  }
  if (!question) return fail("bad_request", "Ask a question first.", 400);
  if (question.length > ASK_MAX_CHARS) return fail("too_long", `Keep it under ${ASK_MAX_CHARS} characters.`, 400);

  const now = Date.now();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (limited(`ip:${ip}`, PER_IP, now)) return fail("rate_limited", "That's a lot of questions. Try again in a few minutes.", 429);
  if (limited("all", GLOBAL, now)) return fail("rate_limited", "Ask SlugGrub is busy right now. Try again later.", 429);

  const key = process.env.GEMINI_API_KEY;
  if (!key) return fail("no_key", "Ask SlugGrub is not set up on this server yet (GEMINI_API_KEY is missing).", 500);

  const found = await candidates(new Date(now));
  if (!found) return fail("no_menu", "No dining hall menus are posted for today or tomorrow, so there's nothing to pick from.", 404);

  const byKey = new Map(found.list.map((c) => [c.key, c]));
  let parsed: { answer?: unknown; picks?: unknown };
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const ask = (thinking: boolean) => ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: promptFor(question, found.list, found.tomorrow) }] }],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: schemaFor([...byKey.keys()]),
        temperature: 0.3,
        ...(thinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
        abortSignal: AbortSignal.timeout(30_000),
      },
    });
    const res = await ask(true).catch((e) => (/thinking/i.test(String(e?.message)) ? ask(false) : Promise.reject(e)));
    try {
      parsed = JSON.parse(res.text ?? "{}");
    } catch {
      parsed = {};
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/ask] Gemini call failed:", msg.slice(0, 300));
    if (/RESOURCE_EXHAUSTED|prepayment credits|billing|"code":\s*(402|429)/i.test(msg)) return fail("out_of_credits", "Ask SlugGrub is out of Gemini credits right now. Try again later.", 503);
    return fail("gemini_error", "Gemini couldn't answer right now. Try again in a moment.", 502);
  }

  const picks: AskPick[] = [];
  for (const p of Array.isArray(parsed.picks) ? parsed.picks : []) {
    const c = byKey.get(String((p as { id?: unknown })?.id ?? ""));
    if (!c || picks.some((x) => x.hallId === c.hallId && x.recipeId === c.dish.recipeId)) continue;
    const reason = String((p as { reason?: unknown })?.reason ?? "").trim().slice(0, 140);
    picks.push({
      recipeId: c.dish.recipeId, name: c.dish.name, hallId: c.hallId, hallShort: c.hallShort, meal: c.meal, open: c.open, when: c.when,
      portion: c.dish.portion, calories: c.dish.nutrition?.calories, proteinG: c.dish.nutrition?.proteinG, reason,
    });
    if (picks.length === 3) break;
  }
  const answer = typeof parsed.answer === "string" && parsed.answer.trim()
    ? parsed.answer.trim().slice(0, 400)
    : picks.length ? "Here's what fits." : "Nothing on the menus fits that right now.";

  return Response.json({ ok: true, question, answer, picks, menuDate: found.menuDate, fallback: found.fallback } satisfies AskResult);
}
