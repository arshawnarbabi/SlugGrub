// Owner: Ethan. Menu fetcher: see PLAN.md, "Menu data". Saves one file per date to data/menus/YYYY-MM-DD.json.
//
//   npm run menus                 every date the site offers now (yesterday through about a week ahead)
//   npm run menus -- 2026-11-15   one date
//   npm run menus -- --purge-zero also drop cached labels that read 0 calories, so they are fetched again
//
// Nutrition labels are cached in data/nutrition-cache.json by the site's "recipe*portion" key (recipes repeat across halls and
// days). A dish whose label is missing or unreadable is saved with no nutrition (unknown), never as 0 calories.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DayMenu, HallId, MealName } from "../src/lib/types.ts";
import { SITE_HALLS, SITE_MEALS, addDays, campusToday, datesOffered, ensureCa, fetchDay, get, shortMenuUrl, type Label } from "./foodpro.ts";

const SCRIPT = fileURLToPath(import.meta.url);
ensureCa(SCRIPT);

const ROOT = path.join(path.dirname(SCRIPT), "..");
const CACHE_FILE = path.join(ROOT, "data", "nutrition-cache.json");
const OUT_DIR = path.join(ROOT, "data", "menus");
const KINDS = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "dish-kinds.json"), "utf8")) as { standingCategories: string[] };
const STANDING = new Set(KINDS.standingCategories);

let labels = new Map<string, Label>();
const loadCache = () => {
  try { labels = new Map(Object.entries(JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")))); } catch { labels = new Map(); }
};
const saveCache = () => fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(labels), null, 1) + "\n", "utf8");

// The parsing and the per-meal rules (short menu says which meals are served, a meal of only standing items is closed, missing
// labels stay unknown) are in src/lib/foodpro.ts, the same code the server's live refresh runs.
export async function fetchMenusForDate(iso: string) {
  console.log(`\n${iso}`);
  let menus: DayMenu[];
  try {
    menus = await fetchDay({
      get, standing: STANDING, labels,
      onHall: (id: HallId, counts: Partial<Record<MealName, number>>) => {
        console.log(`  [${id}] ${SITE_MEALS.map((m) => `${m} ${counts[m] ?? 0}`).join(", ")}`);
        saveCache();
      },
    }, iso);
  } catch (err) {
    console.log(`  ${(err as Error).message}: kept the saved file as it was`);
    return;
  }
  if (!menus.some((m) => Object.keys(m.meals).length)) {
    console.log("  no meals served at any hall: nothing saved");
    return;
  }
  const missing = menus.flatMap((m) => Object.values(m.meals).flat()).filter((d) => d && !d.nutrition).length;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // compact JSON: these files ship with the server build (next.config.ts outputFileTracingIncludes). fetchedAt tells the server
  // how old the file is: older than a few hours, it refreshes the day from the site itself (src/lib/menus.ts).
  fs.writeFileSync(path.join(OUT_DIR, `${iso}.json`), JSON.stringify({ fetchedAt: new Date().toISOString(), menus }) + "\n", "utf8");
  console.log(`  saved data/menus/${iso}.json (${missing} lines with no label)`);
}

async function main() {
  const args = process.argv.slice(2);
  loadCache();
  if (args.includes("--purge-zero")) {
    const zero = [...labels].filter(([, l]) => l?.nutrition?.calories === 0).map(([k]) => k);
    for (const k of zero) labels.delete(k);
    saveCache();
    console.log(`purged ${zero.length} cached labels that read 0 calories`);
  }
  const one = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
  let dates: string[];
  if (one) dates = [one];
  else {
    const today = campusToday();
    const home = await get(shortMenuUrl(SITE_HALLS[0].id, SITE_HALLS[0].name, today));
    dates = [...new Set([addDays(today, -1), ...(home ? datesOffered(home) : [today])])].sort();
  }
  console.log(`Fetching UCSC dining hall menus for ${dates.join(", ")}`);
  for (const iso of dates) await fetchMenusForDate(iso);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Menu fetch failed:", err);
  process.exit(1);
});
