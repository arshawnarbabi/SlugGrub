// Owner: Ethan. What the Halls tab shows, trimmed on the server so the phone gets only that (a day's full menu file is a few
// hundred KB; this is a few dozen): each hall's real dishes per meal today (no salad bar, condiments, drinks, sauces or bars),
// its hours and what it is doing now, and the cafe board.
import { getAllMenus, getCafes, type Cafe } from "./menus";
import { HALLS, hallHoursOn, mealNow, type MealNow } from "./halls";
import { isRealDish } from "./dishKinds";
import type { CampusNow } from "./campusTime";
import type { College, Dish, HallHours, HallId, MealName } from "./types";

export interface HallDish {
  recipeId: string;
  name: string;
  category: string;
  portion?: string;
  calories?: number; // undefined = no UCSC label
  proteinG?: number;
  tags?: string[];
}

export interface HallView {
  id: HallId;
  short: string;
  colleges: College[];
  status: MealNow;
  hours: HallHours[];
  meals: Partial<Record<MealName, HallDish[]>>;
}

export interface CafeView {
  id: string;
  name: string;
  location: string;
  itemCount: number;
  highlights: string[]; // a few food items (not coffee or drinks)
}

export interface HallsData {
  date: string; // campus date asked for
  menuDate: string; // the day the menus come from (differs when that day has no file yet)
  mock: boolean;
  halls: HallView[];
  cafes: CafeView[];
}

const DRINKY = /coffee|tea|boba|drink|beverage|espresso|smoothie/i;

function cafeView(c: Cafe): CafeView {
  const food = c.categories.filter((k) => !DRINKY.test(k.name)).flatMap((k) => k.items);
  const seen = new Set<string>();
  const highlights = food.map((i) => i.name).filter((n) => !seen.has(n) && seen.add(n)).slice(0, 3);
  return { id: c.id, name: c.name, location: c.location, itemCount: c.itemCount, highlights };
}

export async function getHallsData(now: CampusNow): Promise<HallsData> {
  const [menus, cafes] = await Promise.all([getAllMenus(now.date), getCafes()]);
  const halls = HALLS.map((h): HallView => {
    const day = menus.find((m) => m.hallId === h.id);
    const meals: HallView["meals"] = {};
    for (const [meal, dishes] of Object.entries(day?.meals ?? {}) as [MealName, Dish[]][]) {
      const seen = new Set<string>();
      const list: HallDish[] = [];
      for (const d of dishes ?? []) {
        if (!isRealDish(d) || seen.has(d.name)) continue;
        seen.add(d.name);
        list.push({
          recipeId: d.recipeId, name: d.name, category: d.category, portion: d.portion,
          calories: d.nutrition?.calories, proteinG: d.nutrition?.proteinG, ...(d.tags?.length ? { tags: d.tags } : {}),
        });
      }
      if (list.length) meals[meal] = list;
    }
    return { id: h.id, short: h.short, colleges: h.colleges, status: mealNow(h.id, now.date, now.minutes), hours: hallHoursOn(h.id, now.date), meals };
  });
  const first = menus[0];
  return {
    date: now.date,
    menuDate: first?.date ?? now.date,
    mock: !!first?.mock,
    halls,
    cafes: cafes.filter((c) => c.itemCount > 0).map(cafeView),
  };
}
