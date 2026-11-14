// Owner: Arshawn. Takes a plate photo, hall and meal; returns the menu dishes on the plate and how many servings of each.
// Gemini runs here only; the key never reaches the browser.
//
// Method (docs/DECISIONS.md, "Photo log method"): Gemini only RECOGNIZES. It picks dishes from this meal's menu (an enum of
// the menu's recipe ids, so it cannot invent a dish) and estimates servings with the dining hall plate as a ruler. Calories
// and macros always come from the UCSC label numbers on the menu, times servings; never from Gemini.
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { getMenu } from "@/lib/menus";
import { HALLS } from "@/lib/halls";
import type { Dish, HallId, MealName } from "@/lib/types";
import type { LogError, LogErrorCode, LogItem, LogResult } from "./contract";

const MODEL = "gemini-3.8-flash";
const MEALS: MealName[] = ["Breakfast", "Lunch", "Dinner", "Late Night"];
const MAX_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

function fail(error: LogErrorCode, message: string, status: number, extra: Partial<LogError> = {}) {
  return Response.json({ ok: false, error, message, ...extra } satisfies LogError, { status });
}

// What Gemini must return. recipeId is an enum of this meal's menu, so a dish that is not on the menu cannot come back as one.
function schemaFor(menu: Dish[]) {
  return {
    type: "object",
    properties: {
      image_ok: { type: "boolean", description: "false if this is not a photo of food, or too dark or blurry to read" },
      food_found: { type: "boolean", description: "true if there is food in the photo" },
      container: { type: "string", enum: ["plate", "bowl", "flat plate", "to-go box", "other", "unknown"] },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            recipeId: { type: "string", enum: menu.map((d) => d.recipeId) },
            seen_as: { type: "string", description: "what you see on the plate, in a few words" },
            servings: { type: "number", description: "amount on the plate divided by the dish's official portion" },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
          },
          required: ["recipeId", "seen_as", "servings", "confidence"],
        },
      },
      not_on_menu: { type: "array", items: { type: "string" }, description: "foods you see that match no menu dish, a few words each" },
      note: { type: "string", description: "one short sentence for the student, or empty" },
    },
    required: ["image_ok", "food_found", "container", "items", "not_on_menu", "note"],
  };
}

function promptFor(hall: string, meal: MealName, menu: Dish[]) {
  const lines = menu.map((d) => `- ${d.recipeId}: ${d.name} (${d.category}; official portion: ${d.portion ?? "1 serving"})`).join("\n");
  return `You are reading a photo of a student's food at the UCSC ${hall} dining hall, ${meal}.

This meal's menu (the ONLY dishes you may name, by id):
${lines}

Work in this order:
1. Container. UCSC dining halls serve on a round plate about 9 inches across whose food well is about 6 inches across and about 1 inch deep, a bowl about 5 inches across and about 3 inches deep, a flat plate (pizza), or a to-go box. Tell them apart by shape (a bowl shows its outside wall; a plate has a wide rim sloping into the well; a flat plate has a thin raised edge), never by color.
2. Foods. List each separate food you can see. Sauce on a dish is part of that dish, not its own item.
3. Match. Match each food to the one menu dish it most plausibly is. If nothing on the menu fits, put it in not_on_menu in a few words and do NOT force a match. Never return the same id twice.
4. Servings. Use the container as the ruler: the plate's well filled level is about 1.5 cups, a bowl at a normal fill is about 1 cup, a slice or a piece counts as itself. Estimate the amount of each food, then divide by that dish's official portion (for example 1.5 cups of a "1 cup" dish is 1.5 servings; 3 slices of a "1 slice" dish is 3). Round to the nearest quarter.
5. Confidence: high if the dish and amount are clear, low if the food is hidden, mixed, or the match is a stretch.

If the photo is not food, or too dark or blurry to read, set image_ok false. If there is no food, set food_found false and return no items.`;
}

const round = (n: number, step = 0.25) => Math.round(n / step) * step;

export async function POST(request: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return fail("no_key", "The photo log is not set up on this server yet (GEMINI_API_KEY is missing from .env.local).", 500);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("bad_request", "Send the photo as form data.", 400);
  }
  const photo = form.get("photo");
  const hall = HALLS.find((h) => h.id === String(form.get("hall") ?? ""));
  const meal = MEALS.find((m) => m === String(form.get("meal") ?? ""));
  const date = String(form.get("date") ?? "");
  if (!(photo instanceof File) || photo.size === 0) return fail("bad_image", "No photo came through. Try again.", 400);
  if (!hall || !meal || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("bad_request", "Pick a dining hall and a meal first.", 400);
  if (photo.size > MAX_BYTES) return fail("bad_image", "That photo is too big. Try a smaller one.", 413);
  const type = photo.type || "image/jpeg";
  if (!IMAGE_TYPES.includes(type)) return fail("bad_image", "That file isn't a photo we can read. Use a JPEG or PNG.", 415);

  const day = await getMenu(date, hall.id as HallId);
  const menu = (day?.meals[meal] ?? []).filter((d, i, all) => all.findIndex((x) => x.recipeId === d.recipeId) === i);
  if (menu.length === 0) return fail("no_menu", `No ${meal.toLowerCase()} menu for ${hall.short} today, so there is nothing to match against.`, 404);

  let parsed: { image_ok?: boolean; food_found?: boolean; container?: string; items?: { recipeId: string; servings: number; confidence: string }[]; not_on_menu?: string[]; note?: string };
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const data = Buffer.from(await photo.arrayBuffer()).toString("base64");
    const ask = (thinking: boolean) => ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: type, data } }, { text: promptFor(hall.name, meal, menu) }] }],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: schemaFor(menu),
        temperature: 0.2,
        ...(thinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}), // low thinking: faster at the table
        abortSignal: AbortSignal.timeout(45_000),
      },
    });
    // If this model refuses the thinking setting, ask once more without it.
    const res = await ask(true).catch((e) => (/thinking/i.test(String(e?.message)) ? ask(false) : Promise.reject(e)));
    parsed = JSON.parse(res.text ?? "{}");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/log] Gemini call failed:", msg.slice(0, 300));
    if (/RESOURCE_EXHAUSTED|"code":\s*(402|429)/.test(msg)) return fail("gemini_error", "Photo reading is paused: Gemini is out of quota or credits right now. Try again later.", 503);
    return fail("gemini_error", "Gemini couldn't read the plate right now. Try again in a moment.", 502);
  }

  const notOnMenu = (parsed.not_on_menu ?? []).map((s) => String(s).trim()).filter(Boolean).slice(0, 6);
  if (parsed.image_ok === false) return fail("bad_image", "We couldn't make out food in that photo. Try again with the whole plate in good light.", 422);

  const seen = new Set<string>();
  const items: LogItem[] = [];
  for (const it of parsed.items ?? []) {
    const dish = menu.find((d) => d.recipeId === it.recipeId);
    if (!dish || seen.has(dish.recipeId)) continue; // never invent a dish, never count one twice
    seen.add(dish.recipeId);
    const servings = Math.min(6, Math.max(0.25, round(Number(it.servings) || 1)));
    const n = dish.nutrition;
    const per = { calories: n?.calories ?? 0, proteinG: n?.proteinG ?? 0, carbsG: n?.carbsG ?? 0, fatG: n?.fatG ?? 0 };
    const confidence = it.confidence === "high" || it.confidence === "low" ? it.confidence : "medium";
    items.push({ recipeId: dish.recipeId, name: dish.name, servings, calories: Math.round(per.calories * servings), portion: dish.portion, per, confidence, ...(n ? {} : { noLabel: true }) });
  }

  if (items.length === 0) {
    if (notOnMenu.length) return fail("no_food", `We saw ${notOnMenu.join(", ")}, but nothing on ${hall.short}'s ${meal.toLowerCase()} menu.`, 422, { notOnMenu });
    return fail("no_food", "We didn't find any food on this plate. Try again with the whole plate in the photo.", 422);
  }

  const result: LogResult = {
    ok: true, hallId: hall.id, hallShort: hall.short, meal, date,
    container: parsed.container ?? "unknown", items, notOnMenu, note: parsed.note?.trim() || undefined,
  };
  return Response.json(result);
}
