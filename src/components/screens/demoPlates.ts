// Owner: Arshawn. Server only. Each hall's showcase dish per meal today: the first real dish on that meal's menu that has a
// generated image (public/food/gen), main stations first (so a plate is a meal, not a cookie or a soup). Used by Log's demo
// plate and onboarding's hall preview. Read through a one-minute cache (same pattern as Today), so pages still open static.
import { cacheLife } from "next/cache";
import { getAllMenus } from "@/lib/menus";
import { isRealDish } from "@/lib/dishKinds";
import { campusClock } from "@/lib/campusTime";
import type { Dish, HallId, MealName } from "@/lib/types";
import { dishPhoto } from "./dishPhoto";

/** Each hall's showcase plate per meal today: a dish on that menu with a generated image. */
export type DemoPlates = Partial<Record<HallId, Partial<Record<MealName, { name: string; photo: string; date: string }>>>>;
// `date` is the menu day the plate was picked from. Log sends it with the photo, so a page opened before midnight and used after it
// still checks the plate against the menu it came from (his report 2026-11-15: Red Curry Tofu, picked from Saturday, was read
// against Sunday's dinner at 12:01 AM and failed).

const MAINS = new Set(["Entrees", "Hot Bars", "Market Table", "Clean Plate", "Grill", "Pizza", "Breakfast"]);

export async function demoPlates(): Promise<DemoPlates> {
  "use cache";
  cacheLife("minutes");
  const out: DemoPlates = {};
  const date = campusClock(new Date()).date;
  for (const day of await getAllMenus(date)) {
    if (day.fallbackFor || day.mock) continue; // only today's real menus
    for (const [meal, dishes] of Object.entries(day.meals) as [MealName, NonNullable<(typeof day.meals)[MealName]>][]) {
      const pick = (ok: (d: Dish) => boolean) => dishes.find((d) => ok(d) && isRealDish(d) && dishPhoto(d.name));
      const dish = pick((d) => MAINS.has(d.category)) ?? pick(() => true);
      if (dish) (out[day.hallId] ??= {})[meal] = { name: dish.name, photo: dishPhoto(dish.name)!, date };
    }
  }
  return out;
}
