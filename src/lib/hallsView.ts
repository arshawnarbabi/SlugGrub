// Owner: Ethan. What the Halls tab shows, trimmed on the server so the phone gets only that (a day's full menu file is a few
// hundred KB; this is a few dozen): each hall's real dishes per meal today (no salad bar, condiments, drinks, sauces or bars),
// its hours and what it is doing now, and the cafe and market board.
import { getAllMenus, getCafes, type Cafe, type CafeCategory } from "./menus";
import { cafeNow, cafeWeek } from "./cafeHours";
import { isAddOn, SITE_CAFES } from "./foodpro";
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
  highlights: string[]; // up to three things to eat from its menu (not drinks, add-ons or bowl parts)
  kind: "cafe" | "market";
  menuDate?: string; // the day its items come from (the next day it lists a menu when it is closed today)
  status?: string; // "open till 6 PM", "closed today"...; absent when it has no posted hours
  open?: boolean;
}

export interface HallsData {
  date: string; // campus date asked for
  menuDate: string; // the day the menus come from (differs when that day has no file yet)
  mock: boolean;
  halls: HallView[];
  cafes: CafeView[];
  markets?: CafeView[];
}

const DRINKY = /coffee|tea|boba|drink|beverage|espresso|smoothie/i;
const PARTS = /\b(base|protein|finish|topping|sauce)\b/i; // build-your-own bowl parts (Owl's Nest)
const SIDE = /bakery|bagel|side/i; // real food, shown after the mains

/** Up to three things to eat, mains before bakery and sides: real lines from its menu, never drinks, add-ons, bowl parts or
 *  spreads ("Cream Cheese pck"). */
function highlights(c: Cafe): string[] {
  const food = c.categories.filter((k) => !DRINKY.test(k.name) && !PARTS.test(k.name));
  const ordered = [...food.filter((k) => !SIDE.test(k.name)), ...food.filter((k) => SIDE.test(k.name))];
  const seen = new Set<string>();
  return ordered.flatMap((k) => k.items.filter((i) => !isAddOn(k.name, i.name) && !/\bpck\b/i.test(i.name)).map((i) => i.name))
    .filter((n) => !seen.has(n) && seen.add(n)).slice(0, 3);
}

function cafeView(c: Cafe, now: CampusNow): CafeView {
  const status = cafeNow(c.id, now.date, now.minutes);
  return {
    id: c.id, name: c.name, location: c.location, itemCount: c.itemCount, highlights: highlights(c), kind: c.kind ?? "cafe",
    ...(c.menuDate ? { menuDate: c.menuDate } : {}), ...(status ? { status: status.text, open: status.open } : {}),
  };
}

export async function getHallsData(now: CampusNow): Promise<HallsData> {
  const [menus, cafes] = await Promise.all([getAllMenus(now.date), getCafes(now.date)]);
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
    cafes: cafes.filter((c) => c.itemCount > 0 && c.kind !== "market").map((c) => cafeView(c, now)),
    markets: cafes.filter((c) => c.itemCount > 0 && c.kind === "market").map((c) => cafeView(c, now)),
  };
}

/** One cafe or market's full menu page (/halls/cafe/[id]): everything the board row shows, plus its posted week and every
 *  category with its items (portion, price and diet tags where the site lists them; cafes have no nutrition labels). */
export interface CafeMenuView extends CafeView {
  date: string; // campus date asked for
  description: string;
  week: { days: string; hours: string }[]; // posted hours, empty when none are posted
  categories: CafeCategory[];
}

/** The cafe or market with this id (SITE_CAFES in src/lib/foodpro.ts), or null when there is none. */
export async function getCafeMenu(id: string, now: CampusNow): Promise<CafeMenuView | null> {
  const site = SITE_CAFES.find((x) => x.id === id);
  // a location the site lists no menu for keeps its page, with no items
  const c: Cafe | undefined = (await getCafes(now.date)).find((x) => x.id === id) ?? (site && { ...site, short: site.name, itemCount: 0, categories: [] });
  if (!c) return null;
  return { ...cafeView(c, now), date: now.date, description: c.description, week: cafeWeek(c.id), categories: c.categories.filter((k) => k.items.length) };
}
