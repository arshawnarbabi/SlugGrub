// Owner: Arshawn. Photo log. The server picks each hall's demo plate for every meal today: the first real dish on that meal's
// menu that has a generated image (public/food/gen), main stations first (so a plate is a meal, not a cookie or a soup), so "Use
// a demo plate" always sends a dish the menu really has. Read through a one-minute cache (same pattern as Today), so the page
// still opens static.
import { cacheLife } from "next/cache";
import { LogScreen, type DemoPlates } from "@/components/screens/LogScreen";
import { dishPhoto } from "@/components/screens/dishPhoto";
import { getAllMenus } from "@/lib/menus";
import { isRealDish } from "@/lib/dishKinds";
import { campusClock } from "@/lib/campusTime";
import type { Dish, MealName } from "@/lib/types";

const MAINS = new Set(["Entrees", "Hot Bars", "Market Table", "Clean Plate", "Grill", "Pizza", "Breakfast"]);

async function demoPlates(): Promise<DemoPlates> {
  "use cache";
  cacheLife("minutes");
  const out: DemoPlates = {};
  for (const day of await getAllMenus(campusClock(new Date()).date)) {
    if (day.fallbackFor || day.mock) continue; // only today's real menus
    for (const [meal, dishes] of Object.entries(day.meals) as [MealName, NonNullable<(typeof day.meals)[MealName]>][]) {
      const pick = (ok: (d: Dish) => boolean) => dishes.find((d) => ok(d) && isRealDish(d) && dishPhoto(d.name));
      const dish = pick((d) => MAINS.has(d.category)) ?? pick(() => true);
      if (dish) (out[day.hallId] ??= {})[meal] = { name: dish.name, photo: dishPhoto(dish.name)! };
    }
  }
  return out;
}

export default async function Page() {
  return <LogScreen demo={await demoPlates()} />;
}
