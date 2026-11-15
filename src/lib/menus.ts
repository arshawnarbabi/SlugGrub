// Owner: Ethan. Menu data for everyone else. Keep getMenu() and getAllMenus() names and return types stable; others call them.
//
// Where a day comes from, in order:
//   1. data/menus/YYYY-MM-DD.json (npm run menus) when it was fetched less than FRESH_MS ago (its fetchedAt);
//   2. otherwise the UCSC site itself (src/lib/menuLive.ts, same parser as the script), for dates the site can show (yesterday
//      through about 10 days ahead), through Next's cache ("use cache", cacheLife "hours"). A caller waits at most LIVE_WAIT_MS;
//      a slower read keeps going and serves the next caller;
//   3. otherwise the saved file even if older, else the nearest real day marked with `fallbackFor` (the date asked for), never
//      the mock silently. The mock (data/mock/menu.json, marked `mock: true`) is used only when there are no real files at all.
// Committed files stay the fallback. Deployed builds include data/menus, data/cafes.json and data/nutrition-cache.json through
// outputFileTracingIncludes in next.config.ts. Every caller runs inside a "use cache" scope or a route handler, so reading the
// clock here is allowed (cacheComponents).

import fs from "node:fs";
import path from "node:path";
import { cacheLife } from "next/cache";
import type { DayMenu, HallId } from "./types";
import { campusClock, daysBetween } from "./campusTime";
import { fetchLiveDay, type LiveDay } from "./menuLive";
import mock from "../../data/mock/menu.json";

const MENU_DIR = path.join(process.cwd(), "data", "menus");
const CAFES_FILE = path.join(process.cwd(), "data", "cafes.json");

export interface CafeItem {
  recipeId: string;
  name: string;
  portion?: string;
}

export interface CafeCategory {
  name: string;
  items: CafeItem[];
}

export interface Cafe {
  id: string;
  name: string;
  short: string;
  location: string;
  description: string;
  itemCount: number;
  categories: CafeCategory[];
  menuDate?: string; // the day the items were read from the site
}

const FRESH_MS = 3 * 60 * 60_000; // a saved file younger than this is used as is
const LIVE_WAIT_MS = 3_500; // the longest a page or route waits for the site before using the saved menus

interface SavedDay { fetchedAt?: string; menus: DayMenu[] }

// Parsed files stay in memory for the life of the server process (each day's file is a few hundred KB).
const files = new Map<string, SavedDay | null>();
let dates: string[] | null = null;

/** Dates that have a real menu file, oldest first. */
export function menuDates(): string[] {
  if (dates) return dates;
  try {
    dates = fs.readdirSync(MENU_DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).map((f) => f.slice(0, 10)).sort();
  } catch {
    dates = [];
  }
  return dates;
}

function readDay(date: string): SavedDay | null {
  if (files.has(date)) return files.get(date)!;
  let day: SavedDay | null = null;
  if (menuDates().includes(date)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(MENU_DIR, `${date}.json`), "utf8"));
      const menus = Array.isArray(parsed) ? parsed : parsed.menus;
      if (Array.isArray(menus) && menus.length) day = { fetchedAt: parsed.fetchedAt, menus };
    } catch (err) {
      console.warn(`[menus] Could not read data/menus/${date}.json:`, err);
    }
  }
  files.set(date, day);
  return day;
}

/** The live read through Next's cache: an hour before it is read again (the site changes a menu a few times a week at most). */
async function liveDay(date: string): Promise<LiveDay> {
  "use cache";
  cacheLife("hours");
  return fetchLiveDay(date);
}

const building = () => process.env.NEXT_PHASE === "phase-production-build"; // builds use the committed files only

/** The site's own menus for `date`, or null if it can't answer within LIVE_WAIT_MS (or the date is outside its window). */
async function live(date: string): Promise<DayMenu[] | null> {
  if (building()) return null;
  const ahead = daysBetween(campusClock(new Date()).date, date);
  if (ahead < -1 || ahead > 10) return null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), LIVE_WAIT_MS); });
  const read = liveDay(date).then((d) => d.menus, (err) => {
    console.warn(`[menus] live read of ${date} failed, using the saved menus:`, (err as Error).message);
    return null;
  });
  try {
    return await Promise.race([read, late]);
  } finally {
    clearTimeout(timer);
  }
}

/** The real day to serve for `date`: itself if it has a file, else the nearest date that does (ties go to the earlier one). */
export function nearestMenuDate(date: string): string | null {
  const all = menuDates();
  if (all.includes(date)) return date;
  let best: string | null = null;
  for (const d of all) {
    if (best === null || Math.abs(daysBetween(date, d)) < Math.abs(daysBetween(date, best))) best = d;
  }
  return best;
}

async function dayFor(date: string): Promise<DayMenu[]> {
  const saved = readDay(date);
  if (saved?.fetchedAt && Date.now() - Date.parse(saved.fetchedAt) < FRESH_MS) return saved.menus;
  const fresh = await live(date);
  if (fresh) return fresh;
  if (saved) return saved.menus;
  const real = nearestMenuDate(date);
  const near = real ? readDay(real) : null;
  if (near) return near.menus.map((m) => ({ ...m, fallbackFor: date }));
  return (mock.menus as DayMenu[]).map((m) => ({ ...m, mock: true, fallbackFor: date }));
}

export async function getMenu(date: string, hallId: HallId): Promise<DayMenu | null> {
  return (await dayFor(date)).find((m) => m.hallId === hallId) ?? null;
}

export async function getAllMenus(date: string): Promise<DayMenu[]> {
  return dayFor(date);
}

let cafes: Cafe[] | null = null;
export async function getCafes(): Promise<Cafe[]> {
  if (cafes) return cafes;
  try {
    const parsed = JSON.parse(fs.readFileSync(CAFES_FILE, "utf8")) as { cafes?: Cafe[] };
    cafes = parsed.cafes ?? [];
  } catch (err) {
    console.warn("[menus] Could not read data/cafes.json:", err);
    cafes = [];
  }
  return cafes;
}
