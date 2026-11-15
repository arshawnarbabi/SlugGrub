// Owner: Arshawn. Demo mode's example plates (his ask 2026-11-15: a demo button that "primes the webapp in demo mode"). When
// onboarding finishes with demo mode on and nothing is logged today, this writes one or two plates for today from real dishes on
// today's menus (/api/demo, the catalog the mock rankings use), each with its UCSC label calories, at the student's usual hall when it
// serves that meal and at another hall when it doesn't. Every id starts "demo-" (plates.ts DEMO_PLATE), so Leave demo removes them and
// nothing else. Browser only; plates stay on this device like every plate (calories are private).
import type { DemoCatalog } from "@/app/api/demo/route";
import type { CatalogDish } from "@/lib/rankCore";
import type { HallId, MealName, PlateLog } from "@/lib/types";
import { DEMO_PLATE, loadPlates, savePlates } from "./plates";
import { localDate } from "./now";

// a plate is a meal, not a cookie or a soup: a main from these stations (best first, at least 150 calories), plus a second dish from
// the same hall and meal (a hot bar side, say); the catalog holds only rankable stations, so sweets and soups are skipped by name
const MAINS = ["Entrees", "Grill", "Pizza", "Clean Plate", "Market Table", "Breakfast", "Hot Bars"];
const NOT_SIDE = new Set(["Sweet Treats", "Sweets Treats", "Soups"]);
// when each example plate is "eaten", in this device's clock (hours, minutes); a meal counts once it is 30 minutes past
const MEAL_AT: [MealName, number, number][] = [["Breakfast", 8, 45], ["Lunch", 12, 30], ["Dinner", 18, 0]];

const hasCal = (d: CatalogDish) => typeof d.calories === "number" && d.calories > 0;

function pick(dishes: CatalogDish[], meal: MealName, hall: HallId, used: Set<string>) {
  const inMeal = dishes.filter((d) => d.meals.includes(meal) && hasCal(d) && !used.has(d.key));
  const rank = (d: CatalogDish) => { const i = MAINS.indexOf(d.category); return i < 0 ? 99 : i; };
  for (const pool of [inMeal.filter((d) => d.hallId === hall), inMeal]) {
    const main = pool.filter((d) => rank(d) < 99 && (d.calories ?? 0) >= 150).sort((x, y) => rank(x) - rank(y))[0];
    if (!main) continue;
    const side = pool.find((d) => d.hallId === main.hallId && d.key !== main.key && !NOT_SIDE.has(d.category));
    return side ? [main, side] : [main];
  }
  return null;
}

/** Writes today's example plates if nothing is logged today. Returns how many it wrote (0 if none were needed or none could be made). */
export async function seedDemoPlates(hall: HallId, now = new Date()): Promise<number> {
  const today = localDate(now);
  if (loadPlates().some((p) => typeof p?.at === "string" && localDate(new Date(p.at)) === today)) return 0;
  let cat: DemoCatalog;
  try {
    const res = await fetch("/api/demo", { cache: "no-store" });
    if (!res.ok) return 0;
    cat = await res.json();
  } catch {
    return 0;
  }
  const mins = now.getHours() * 60 + now.getMinutes();
  // the last two meals already eaten today; before breakfast is over, one plate "just now" from breakfast
  let meals = MEAL_AT.filter(([, h, m]) => h * 60 + m + 30 <= mins).slice(-2).map(([meal, h, m]) => ({ meal, h, m }));
  if (meals.length === 0) meals = [{ meal: "Breakfast", h: now.getHours(), m: Math.max(0, now.getMinutes() - 5) }];
  const used = new Set<string>();
  const plates: PlateLog[] = [];
  for (const { meal, h, m } of meals) {
    const dishes = pick(cat.today ?? [], meal, hall, used);
    if (!dishes) continue;
    dishes.forEach((d) => used.add(d.key));
    const at = new Date(now);
    at.setHours(h, m, 0, 0);
    const items = dishes.map((d) => ({ recipeId: d.recipeId, name: d.name, servings: 1, calories: Math.round(d.calories ?? 0) }));
    const proteinG = Math.round(dishes.reduce((n, d) => n + (Number((d as { proteinG?: number }).proteinG) || 0), 0));
    plates.push({ id: `${DEMO_PLATE}${today}-${meal.toLowerCase()}`, at: at.toISOString(), hallId: dishes[0].hallId, meal, items, totalCalories: items.reduce((n, i) => n + i.calories, 0), proteinG });
  }
  return plates.length && savePlates(plates) ? plates.length : 0;
}
