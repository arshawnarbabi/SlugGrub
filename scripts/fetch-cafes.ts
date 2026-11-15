// Owner: Ethan. Cafe board data: reads each campus cafe's menu from the FoodPro site (https://nutrition.sa.ucsc.edu) and writes
// data/cafes.json. Cafe menus don't rotate, so one served day per cafe is enough (cafes close on weekends, so the script walks
// the dates the site offers until each cafe has one). Markets are left out. Location and description lines are hand-written
// and kept from the existing file.
//
//   npm run cafes
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addDays, campusToday, datesOffered, ensureCa, get, longMenuUrl, mealsOffered, parseLongMenu, shortMenuUrl } from "./foodpro.ts";

const SCRIPT = fileURLToPath(import.meta.url);
ensureCa(SCRIPT);

const OUT = path.join(path.dirname(SCRIPT), "..", "data", "cafes.json");

const CAFES: { id: string; name: string; location: string }[] = [
  { id: "21", name: "Banana Joe's", location: "Crown College" },
  { id: "23", name: "Oakes Cafe", location: "Oakes College" },
  { id: "46", name: "Global Village Cafe", location: "McHenry Library" },
  { id: "24", name: "Owl's Nest Cafe", location: "Kresge College" },
  { id: "45", name: "UCen Coffee Bar", location: "Quarry Plaza" },
  { id: "26", name: "Stevenson Coffee House", location: "Stevenson College" },
  { id: "22", name: "Perk Coffee Bar", location: "Baskin Engineering" },
];

type Item = { recipeId: string; name: string; portion?: string; tags?: string[] };
type Category = { name: string; items: Item[] };

const old = (() => {
  try {
    return (JSON.parse(fs.readFileSync(OUT, "utf8")).cafes ?? []) as { id: string; description?: string; location?: string }[];
  } catch {
    return [];
  }
})();

// Category names on the site sometimes carry notices ("Coffee & Tea Now City of Santa Cruz Cup Fee of $.025 ..."); keep the name.
const cleanCategory = (c: string) => c.replace(/\s+Now City of Santa Cruz.*$/i, "").trim();

async function main() {
  const today = campusToday();
  const first = await get(shortMenuUrl(CAFES[0].id, CAFES[0].name, today));
  const dates = [...new Set([...(first ? datesOffered(first) : [today]), addDays(today, -1)])].sort();
  const out = [];
  for (const cafe of CAFES) {
    let found: { date: string; categories: Category[] } | null = null;
    for (const date of dates) {
      const short = await get(shortMenuUrl(cafe.id, cafe.name, date));
      if (!short || !/shortmenurecipes/.test(short)) continue; // closed that day
      const cats = new Map<string, Category>();
      for (const meal of mealsOffered(short)) {
        const html = await get(longMenuUrl(cafe.id, cafe.name, date, meal));
        for (const it of html ? parseLongMenu(html) : []) {
          const name = cleanCategory(it.category);
          const cat = cats.get(name) ?? { name, items: [] };
          if (!cat.items.some((x) => x.recipeId === it.recipeId)) {
            cat.items.push({ recipeId: it.recipeId, name: it.name, ...(it.portion ? { portion: it.portion } : {}), ...(it.tags.length ? { tags: it.tags } : {}) });
          }
          cats.set(name, cat);
        }
      }
      if (cats.size) { found = { date, categories: [...cats.values()] }; break; }
    }
    const prev = old.find((c) => c.id === cafe.id);
    const itemCount = found ? found.categories.reduce((n, c) => n + c.items.length, 0) : 0;
    console.log(`[${cafe.id}] ${cafe.name}: ${found ? `${itemCount} items from ${found.date}` : "no menu on any offered day"}`);
    out.push({
      id: cafe.id, name: cafe.name, short: cafe.name, location: prev?.location ?? cafe.location, description: prev?.description ?? "",
      itemCount, menuDate: found?.date, categories: found?.categories ?? [],
    });
  }
  const note = "Owner: Ethan. Campus cafe menus (not dining halls or markets), read from https://nutrition.sa.ucsc.edu/ by scripts/fetch-cafes.ts (npm run cafes). Location and description are hand-written.";
  fs.writeFileSync(OUT, JSON.stringify({ _note: note, fetchedOn: today, cafes: out }, null, 1) + "\n", "utf8");
  console.log(`saved data/cafes.json`);
}

main().catch((err) => {
  console.error("Cafe fetch failed:", err);
  process.exit(1);
});
