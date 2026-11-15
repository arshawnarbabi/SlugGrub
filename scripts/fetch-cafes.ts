// Owner: Ethan. Cafe and market board data: reads each campus cafe's and market's menu from the FoodPro site
// (https://nutrition.sa.ucsc.edu) and writes data/cafes.json. The parsing is src/lib/foodpro.ts (fetchCafes), the same code the
// server's live refresh runs (src/lib/menuLive.ts): each location gets the menu the site lists today, or on the next day it lists
// one (cafes and markets close on weekends). Items are the site's short menu lines with their prices. The location list, where
// each one is and its description are SITE_CAFES in src/lib/foodpro.ts; hours are src/lib/cafeHours.ts.
//
//   npm run cafes
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addDays, campusToday, ensureCa, fetchCafes, get } from "./foodpro.ts";

const SCRIPT = fileURLToPath(import.meta.url);
ensureCa(SCRIPT);

const OUT = path.join(path.dirname(SCRIPT), "..", "data", "cafes.json");

async function main() {
  const today = campusToday();
  const dates = Array.from({ length: 8 }, (_, i) => addDays(today, i)); // the site shows about a week ahead
  const cafes = await fetchCafes(get, dates, (c) =>
    console.log(`[${c.id}] ${c.name}: ${c.menuDate ? `${c.itemCount} items from ${c.menuDate}` : "no menu on any offered day"}`));
  if (!cafes.some((c) => c.itemCount)) throw new Error("the site lists no cafe or market menus this week: kept the saved file");
  const note = "Owner: Ethan. Campus cafe and market menus (not dining halls), read from https://nutrition.sa.ucsc.edu/ by scripts/fetch-cafes.ts (npm run cafes). fetchedOn is the campus date the menus were picked for; each location's menuDate is the day its items come from.";
  // fetchedAt tells the server how old the file is: older than a few hours (or from another day) it reads the site itself.
  fs.writeFileSync(OUT, JSON.stringify({ _note: note, fetchedAt: new Date().toISOString(), fetchedOn: today, cafes }, null, 1) + "\n", "utf8");
  console.log(`saved data/cafes.json`);
}

main().catch((err) => {
  console.error("Cafe fetch failed:", err);
  process.exit(1);
});
