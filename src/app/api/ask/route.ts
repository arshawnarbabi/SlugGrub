// Owner: Ethan. Ask SlugGrub: takes a question, returns up to 3 dishes from the meal each dining hall is serving now (or next
// today). Gemini runs here only; the key never reaches the browser.
//
// Gemini only PICKS: dish ids are an enum of this meal's real dishes (no condiments, drinks, sauces or bars), so it cannot invent
// one, and the calories and protein shown always come from the UCSC labels, never from Gemini. Questions are capped at
// ASK_MAX_CHARS and each address gets a few questions per window, so outsiders can't run up the bill.
// Streaming (2026-11-15): with `Accept: application/x-ndjson` every real step goes out as it starts (menus, halls, the Gemini
// call, its thought headings, the answer text, the label match), then the picks; contract.ts has the events.
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { getAllMenus } from "@/lib/menus";
import { HALLS, hallHoursOn, mealNow } from "@/lib/halls";
import { isDrink, isRealDish } from "@/lib/dishKinds";
import { addDays, campusClock, clockLabel } from "@/lib/campusTime";
import type { Dish, HallId, MealName } from "@/lib/types";
import { ASK_MAX_CHARS, ASK_STREAM_TYPE, type AskError, type AskErrorCode, type AskEvent, type AskPick, type AskResult } from "./contract";

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
type Failure = AskError & { status: number };
const failure = (error: AskErrorCode, message: string, status: number): Failure => ({ ok: false, error, message, status });

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

/** The halls step, in words: "Checking lunch at JRL/C9 and Carson/Oakes" (meal first, so a cut line still says it). */
function hallsLine(list: Candidate[], tomorrow: boolean) {
  const byMeal = new Map<string, string[]>();
  for (const c of list) {
    const halls = byMeal.get(c.meal) ?? [];
    if (!halls.includes(c.hallShort)) halls.push(c.hallShort);
    byMeal.set(c.meal, halls);
  }
  const and = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
  const parts = [...byMeal].map(([meal, halls]) => `${meal.toLowerCase()} at ${halls.length === HALLS.length ? `all ${halls.length} halls` : and(halls)}`);
  return `Checking ${tomorrow ? "tomorrow's " : ""}${parts.join(" and ")}`;
}

// Words the thought headings keep capitalized when the line puts them in sentence case (his rule: sentence case, never Title Case).
const PROPER = new Set(["I", "UCSC", "Gemini", "Slug", "Points", ...HALLS.flatMap((h) => [...h.short.split("/"), ...h.colleges.flatMap((c) => c.split(" "))])]);

/** Gemini's thought summaries open with a bold heading ("**Analyzing Protein Options**"); the newest whole one, in sentence case. */
function thoughtHeading(thoughts: string): string | null {
  const all = [...thoughts.matchAll(/\*\*([^*\n]{3,70})\*\*/g)];
  const last = all[all.length - 1]?.[1]?.trim().replace(/[.:]+$/, "");
  if (!last) return null;
  return last.split(" ").map((w, i) => (i === 0 || PROPER.has(w) || !/^[A-Z][a-z']+$/.test(w) ? w : w.toLowerCase())).join(" ");
}

/** The "answer" string of a JSON reply that is still arriving, decoded as far as it goes (the schema puts it first). */
function partialAnswer(raw: string): string {
  const m = /"answer"\s*:\s*"/.exec(raw);
  if (!m) return "";
  const ESC: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f" };
  let out = "";
  for (let i = m.index + m[0].length; i < raw.length; i++) {
    const c = raw[i];
    if (c === '"') break;
    if (c !== "\\") { out += c; continue; }
    const n = raw[i + 1];
    if (n === undefined) break; // the escape's second half has not arrived yet
    if (n === "u") {
      if (i + 6 > raw.length) break;
      out += String.fromCharCode(parseInt(raw.slice(i + 2, i + 6), 16));
      i += 5;
    } else {
      out += ESC[n] ?? n;
      i++;
    }
  }
  return out;
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
    propertyOrdering: ["answer", "picks"], // the answer streams first; the picks follow
  };
}

// Vercel: route handlers run on the Node runtime by default (the Gemini SDK and the menu fetcher need it) and a POST is never cached,
// so the NDJSON stream flushes event by event. No "runtime" or "dynamic" segment config: cacheComponents rejects both.

const MAX_ANSWER = 400;

/** The work itself, shared by both modes: every real step is announced through `emit` as it starts (the JSON mode ignores them). */
async function answerQuestion(question: string, now: number, signal: AbortSignal, key: string, emit: (e: AskEvent) => void): Promise<AskResult | Failure> {
  emit({ type: "step", step: "menus", text: "Reading today's menus" });
  const found = await candidates(new Date(now));
  if (!found) return failure("no_menu", "No dining hall menus are posted for today or tomorrow, so there's nothing to pick from.", 404);
  emit({ type: "step", step: "halls", text: hallsLine(found.list, found.tomorrow) });

  const byKey = new Map(found.list.map((c) => [c.key, c]));
  let raw = "";
  let sent = "";
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const ask = (thinking: boolean) => ai.models.generateContentStream({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: promptFor(question, found.list, found.tomorrow) }] }],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: schemaFor([...byKey.keys()]),
        temperature: 0.3,
        // includeThoughts: Gemini sends short thought summaries alongside the answer; their headings are the action line. MEDIUM,
        // not LOW (2026-11-15): at LOW gemini-3.8-flash sent no thought summaries at all in testing; MEDIUM sends them for about a
        // second more of thinking, which the orb and the action line now fill.
        ...(thinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM, includeThoughts: true } } : {}),
        abortSignal: AbortSignal.any([signal, AbortSignal.timeout(30_000)]),
      },
    });
    emit({ type: "step", step: "asking", text: `Asking Gemini about ${found.list.length} dishes` });
    const stream = await ask(true).catch((e) => (/thinking/i.test(String(e?.message)) ? ask(false) : Promise.reject(e)));
    let thoughts = "";
    let heading: string | null = null;
    for await (const chunk of stream) {
      for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
        if (!part.text) continue;
        if (part.thought) {
          thoughts += part.text;
          const h = thoughtHeading(thoughts);
          if (h && h !== heading) emit({ type: "step", step: "thinking", text: (heading = h) });
          continue;
        }
        raw += part.text;
        const got = partialAnswer(raw).trimStart().slice(0, MAX_ANSWER);
        if (got.length > sent.length && got.startsWith(sent)) {
          if (!sent) emit({ type: "step", step: "writing", text: "Writing" });
          emit({ type: "delta", text: got.slice(sent.length) });
          sent = got;
        }
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/ask] Gemini call failed:", msg.slice(0, 300));
    if (/RESOURCE_EXHAUSTED|prepayment credits|billing|"code":\s*(402|429)/i.test(msg)) return failure("out_of_credits", "Ask SlugGrub is out of Gemini credits right now. Try again later.", 503);
    return failure("gemini_error", "Gemini couldn't answer right now. Try again in a moment.", 502);
  }

  emit({ type: "step", step: "matching", text: "Matching picks to UCSC labels" });
  let parsed: { answer?: unknown; picks?: unknown };
  try {
    parsed = JSON.parse(raw || "{}");
  } catch {
    parsed = {};
  }
  // Only ids from this meal's own list become picks, and every number shown comes from the UCSC label, never from Gemini.
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
  if (picks.length) emit({ type: "picks", picks });
  const full = typeof parsed.answer === "string" ? parsed.answer.trim().slice(0, MAX_ANSWER) : sent.trim();
  const answer = full || (picks.length ? "Here's what fits." : "Nothing on the menus fits that right now.");
  return { ok: true, question, answer, picks, menuDate: found.menuDate, fallback: found.fallback };
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

  // One JSON answer, as before, for any caller that does not ask for the stream.
  if (!req.headers.get("accept")?.includes(ASK_STREAM_TYPE)) {
    const out = await answerQuestion(question, now, req.signal, key, () => {});
    if (!out.ok) return fail(out.error, out.message, out.status);
    return Response.json(out satisfies AskResult);
  }

  // The stream: one JSON event per line, each written the moment its step starts; "done" or "error" is always the last line.
  const enc = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let open = true;
      const emit = (e: AskEvent) => {
        if (!open) return;
        try {
          controller.enqueue(enc.encode(JSON.stringify(e) + "\n"));
        } catch {
          open = false; // the student left; the abort signal stops Gemini
        }
      };
      try {
        const out = await answerQuestion(question, now, req.signal, key, emit);
        emit(out.ok ? { type: "done", result: out } : { type: "error", error: out.error, message: out.message });
      } catch (e) {
        console.error("[api/ask] stream failed:", e instanceof Error ? e.message.slice(0, 300) : e);
        emit({ type: "error", error: "gemini_error", message: "Gemini couldn't answer right now. Try again in a moment." });
      }
      if (open) controller.close();
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": `${ASK_STREAM_TYPE}; charset=utf-8`,
      "Cache-Control": "no-cache, no-transform", // no-transform: nothing on the way may gzip (and so buffer) the stream
      "X-Accel-Buffering": "no",
    },
  });
}
