// Owner: Karen. Server only: the rankable dishes on today's real UCSC menus (Ethan's getAllMenus), by hall and recipe id.
// Falls back to the seed list when no real menu is saved for the day (getAllMenus then returns the mock menu, ids "mock-...").
import { getAllMenus } from "./menus";
import { catalogFromMenus, SEED_CATALOG, type CatalogDish } from "./rankCore";

export interface Catalog { date: string; source: "menus" | "seed"; dishes: CatalogDish[] }

/** Campus date (Pacific), YYYY-MM-DD. Call from a route handler or a "use cache" function, never during render. */
export function campusDate(d = new Date()): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(d).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

const cache = new Map<string, Promise<Catalog>>();

export function getCatalog(date = campusDate()): Promise<Catalog> {
  let hit = cache.get(date);
  if (!hit) {
    hit = (async (): Promise<Catalog> => {
      try {
        const menus = await getAllMenus(date);
        const real = menus.some((m) => Object.values(m.meals).some((ds) => ds?.some((d) => !d.recipeId.startsWith("mock-"))));
        const dishes = real ? catalogFromMenus(menus) : [];
        if (dishes.length >= 2) return { date, source: "menus", dishes };
      } catch (err) {
        console.warn("[rankings] menus unavailable, using the seed list:", err);
      }
      return { date, source: "seed", dishes: SEED_CATALOG };
    })();
    cache.set(date, hit);
    // a seed result is not kept: the menu fetcher may save today's file later
    hit.then((c) => { if (c.source === "seed") cache.delete(date); });
    if (cache.size > 8) cache.delete(cache.keys().next().value as string);
  }
  return hit;
}
