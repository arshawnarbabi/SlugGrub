// Owner: Ethan. Menu fetcher: see PLAN.md, "Menu data". Saves one file per date to data/menus/YYYY-MM-DD.json.
//
//   npm run menus                 every date the site offers now (yesterday through about a week ahead)
//   npm run menus -- 2026-11-15   one date
//   npm run menus -- --purge-zero also drop cached labels that read 0 calories, so they are fetched again
//
// Nutrition labels are cached in data/nutrition-cache.json by the site's "recipe*portion" key (recipes repeat across halls and
// days). A dish whose label is missing or unreadable is saved with no nutrition (unknown), never as 0 calories.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DayMenu, Dish, HallId, MealName, Nutrition } from "../src/lib/types.ts";
import { BASE_URL, addDays, campusToday, datesOffered, decodeText, dtdate, ensureCa, get, longMenuUrl, parseLongMenu, shortMenuUrl } from "./foodpro.ts";

const SCRIPT = fileURLToPath(import.meta.url);
ensureCa(SCRIPT);

const ROOT = path.join(path.dirname(SCRIPT), "..");
const CACHE_FILE = path.join(ROOT, "data", "nutrition-cache.json");
const OUT_DIR = path.join(ROOT, "data", "menus");
const KINDS = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "dish-kinds.json"), "utf8")) as { standingCategories: string[] };
const STANDING = new Set(KINDS.standingCategories);

const HALLS: { id: HallId; name: string }[] = [
  { id: "40", name: "John R. Lewis & College Nine Dining Hall" },
  { id: "05", name: "Cowell & Stevenson Dining Hall" },
  { id: "20", name: "Crown & Merrill Dining Hall" },
  { id: "25", name: "Porter & Kresge Dining Hall" },
  { id: "30", name: "Rachel Carson & Oakes Dining Hall" },
];
const MEALS: MealName[] = ["Breakfast", "Lunch", "Dinner", "Late Night"];

type Label = { nutrition: Nutrition; allergens?: string };
let cache: Record<string, Label> = {};
const loadCache = () => {
  try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch { cache = {}; }
};
const saveCache = () => fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1) + "\n", "utf8");

/** The label's numbers, or null when the page has no readable calorie line (label missing). */
export function parseLabel(html: string): Label | null {
  const cal = html.match(/<b>Calories&nbsp;(\d+(?:\.\d+)?)<\/b>/i);
  if (!cal) return null;
  const num = (re: RegExp) => {
    const m = html.match(re);
    return m ? parseFloat(m[1]) : undefined;
  };
  const serving = html.match(/Serving Size&nbsp;<\/font><font[^>]*>([^<]+)<\/font>/i);
  const allergens = html.match(/<span class="labelallergensvalue">([^<]+)<\/span>/i);
  return {
    nutrition: {
      calories: Math.round(parseFloat(cal[1])),
      servingSize: serving ? decodeText(serving[1]) : undefined,
      proteinG: num(/<b>Protein&nbsp;<\/b><\/font><font[^>]*>([\d.]+)g/i),
      carbsG: num(/<b>Tot\. Carb\.&nbsp;<\/b><\/font><font[^>]*>([\d.]+)g/i),
      fatG: num(/<b>Total Fat&nbsp;<\/b><\/font><font[^>]*>([\d.]+)g/i),
      fiberG: num(/Dietary Fiber&nbsp;<\/font><font[^>]*>([\d.]+)g/i),
      sugarsG: num(/Sugars&nbsp;<\/font><font[^>]*>([\d.]+)g/i),
      sodiumMg: num(/<b>Sodium&nbsp;<\/b><\/font><font[^>]*>([\d.]+)mg/i),
    },
    allergens: allergens ? decodeText(allergens[1]) || undefined : undefined,
  };
}

/** labelKey is the site's own "recipe*portion" string, already URL-encoded ("400082*1%2f12"): it goes into the URL as is.
 *  (Encoding it again turned "1%2f12" into "1%252f12", which the site answers with an empty label: the 0-calorie bug.) */
async function label(hallId: string, iso: string, labelKey: string): Promise<Label | null> {
  if (cache[labelKey]) return cache[labelKey];
  const html = await get(`${BASE_URL}/label.aspx?locationNum=${hallId}&dtdate=${dtdate(iso)}&RecNumAndPort=${labelKey}`);
  const parsed = html ? parseLabel(html) : null;
  if (parsed) cache[labelKey] = parsed; // missing labels are not cached, so the next run tries again
  return parsed;
}

async function hallMeal(hall: { id: HallId; name: string }, iso: string, meal: MealName): Promise<Dish[]> {
  const html = await get(longMenuUrl(hall.id, hall.name, iso, meal));
  if (!html) return [];
  const items = parseLongMenu(html);
  // The long menu lists the standing items (salad bar, condiments, drinks...) even when the hall is closed for that meal.
  // A meal with nothing but standing items is not being served.
  if (!items.some((it) => !STANDING.has(it.category))) return [];
  const dishes: Dish[] = [];
  for (const it of items) {
    const l = await label(hall.id, iso, it.labelKey);
    dishes.push({
      recipeId: it.recipeId,
      name: it.name,
      category: it.category,
      portion: it.portion ?? l?.nutrition.servingSize,
      ...(l ? { nutrition: l.nutrition } : {}),
      ...(l?.allergens ? { allergens: l.allergens } : {}),
      ...(it.tags.length ? { tags: it.tags } : {}),
    });
  }
  return dishes;
}

export async function fetchMenusForDate(iso: string) {
  console.log(`\n${iso}`);
  const menus: DayMenu[] = [];
  let missing = 0;
  for (const hall of HALLS) {
    const meals: Partial<Record<MealName, Dish[]>> = {};
    const said: string[] = [];
    for (const meal of MEALS) {
      const dishes = await hallMeal(hall, iso, meal);
      if (dishes.length) {
        meals[meal] = dishes;
        missing += dishes.filter((d) => !d.nutrition).length;
      }
      said.push(`${meal} ${dishes.length}`);
    }
    console.log(`  [${hall.id}] ${said.join(", ")}`);
    menus.push({ date: iso, hallId: hall.id, meals });
    saveCache();
  }
  if (!menus.some((m) => Object.keys(m.meals).length)) {
    console.log("  no meals served at any hall: nothing saved");
    return;
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // compact JSON: these files ship with the server build (next.config.ts outputFileTracingIncludes)
  fs.writeFileSync(path.join(OUT_DIR, `${iso}.json`), JSON.stringify({ menus }) + "\n", "utf8");
  console.log(`  saved data/menus/${iso}.json (${missing} lines with no label)`);
}

async function main() {
  const args = process.argv.slice(2);
  loadCache();
  if (args.includes("--purge-zero")) {
    const zero = Object.keys(cache).filter((k) => cache[k]?.nutrition?.calories === 0);
    for (const k of zero) delete cache[k];
    saveCache();
    console.log(`purged ${zero.length} cached labels that read 0 calories`);
  }
  const one = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
  let dates: string[];
  if (one) dates = [one];
  else {
    const today = campusToday();
    const home = await get(shortMenuUrl(HALLS[0].id, HALLS[0].name, today));
    dates = [...new Set([addDays(today, -1), ...(home ? datesOffered(home) : [today])])].sort();
  }
  console.log(`Fetching UCSC dining hall menus for ${dates.join(", ")}`);
  for (const iso of dates) await fetchMenusForDate(iso);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Menu fetch failed:", err);
  process.exit(1);
});
