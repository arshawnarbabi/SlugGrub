// Owner: Arshawn. Demo mode only (src/lib/rankDemo.ts): this week's real dish catalog, so the browser can build believable mock
// rankings from real hall ids, recipe ids, names and photos. Read only: it never writes votes anywhere.
//   today: the same catalog the ranking screens get (rankCatalog.ts); others: rankable dishes from the rest of the week (Monday to Sunday) not on today's menus.
import { connection } from "next/server";
import { getAllMenus } from "@/lib/menus";
import { campusDate, getCatalog } from "@/lib/rankCatalog";
import { catalogFromMenus, weekOf, type CatalogDish } from "@/lib/rankCore";

export interface DemoCatalog { week: string; date: string; today: CatalogDish[]; others: CatalogDish[] }

const cache = new Map<string, Promise<DemoCatalog>>();

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

async function build(date: string): Promise<DemoCatalog> {
  const week = weekOf(date);
  const today = (await getCatalog(date)).dishes;
  const days = await Promise.all(Array.from({ length: 7 }, (_, i) => getAllMenus(addDays(week, i)).catch(() => [])));
  const seen = new Set(today.map((c) => c.key));
  const rest: CatalogDish[] = [];
  for (const menus of days) {
    for (const c of catalogFromMenus(menus.filter((m) => !m.mock))) {
      if (seen.has(c.key)) continue;
      seen.add(c.key);
      rest.push(c);
    }
  }
  return { week, date, today, others: rest };
}

export async function GET() {
  await connection(); // at request time: the week follows the campus clock
  const date = campusDate();
  let hit = cache.get(date);
  if (!hit) {
    hit = build(date);
    cache.set(date, hit);
    hit.catch(() => cache.delete(date));
    if (cache.size > 4) cache.delete(cache.keys().next().value as string);
  }
  return Response.json(await hit, { headers: { "Cache-Control": "no-store" } });
}
