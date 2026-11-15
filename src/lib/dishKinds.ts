// Owner: Ethan. Which menu lines are real dishes (shown in Halls, sent to Ask) and which are components or standing items
// (salad bar, condiments, drinks, sauces, buns, build-your-own bars). The lists live in data/dish-kinds.json, which the menu
// fetcher also reads, so the app and the script agree.
import kinds from "../../data/dish-kinds.json";
import type { Dish } from "./types";

const STANDING = new Set<string>(kinds.standingCategories);
const SKIP = new Set<string>(kinds.skipNames.map((n) => n.toLowerCase()));
const SKIP_RE = new RegExp(kinds.skipPattern, "i");

/** A category that is on the menu every meal (salad bar, deli bar, condiments, cereal, bread, drinks, fruit). */
export const isStanding = (category: string) => STANDING.has(category);

/** A dish someone would pick or rate on its own: not a standing item, sauce, bun, broth, plain base or build-your-own bar. */
export function isRealDish(d: Pick<Dish, "name" | "category">): boolean {
  if (STANDING.has(d.category)) return false;
  const n = d.name.trim();
  return !SKIP.has(n.toLowerCase()) && !SKIP_RE.test(n);
}

/** Drinks, for Ask (never recommended as a meal). */
export const isDrink = (d: Pick<Dish, "category">) => d.category === "Beverages";
