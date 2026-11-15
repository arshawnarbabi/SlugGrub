// Owner: Arshawn. How a dish is named in the app when the UCSC menu's own name misleads students.
// A burger patty at the grill is served as the whole burger (bun, cheese, lettuce, tomato, condiments the student picks), so the app
// calls it a burger (his ask 2026-11-15: "for the patty dishes its usualy hte entire burger with condoments studnets can choose, not
// just hte patty"). Breakfast sausage patties and hash brown patties stay as they are. Calories still come from the patty's own UCSC
// label: the bun and toppings are their own menu items. scripts/food-images.mjs applies the same rule to name the generated photos.
import type { DayMenu } from "./types";

const PATTY = /\bPatty$/;
const NOT_A_BURGER = /sausage|hash brown/i;

export function displayDishName(name: string): string {
  return PATTY.test(name) && !NOT_A_BURGER.test(name) ? name.replace(PATTY, "Burger") : name;
}

/** The menus with display names applied (only allocates when a name changes). */
export function withDisplayNames(menus: DayMenu[]): DayMenu[] {
  return menus.map((m) => {
    let changed = false;
    const meals = Object.fromEntries(Object.entries(m.meals).map(([meal, dishes]) => [meal, dishes?.map((d) => {
      const name = displayDishName(d.name);
      if (name === d.name) return d;
      changed = true;
      return { ...d, name };
    })]));
    return changed ? { ...m, meals: meals as DayMenu["meals"] } : m;
  });
}
