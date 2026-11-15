// Owner: Ethan. Menu data for everyone else. Keep getMenu() and getAllMenus() names and return types stable; others call them.
//
// Where a day comes from, in order:
//   1. data/menus/YYYY-MM-DD.json (npm run menus) when it was fetched less than FRESH_MS ago (its fetchedAt);
//   2. otherwise the UCSC site itself (src/lib/menuLive.ts, same parser as the script), for dates the site can show (yesterday
//      through about 10 days ahead), through Next's cache ("use cache", cacheLife "hours"). A caller waits at most LIVE_WAIT_MS;
//      a slower read keeps going and serves the next caller;
//   3. otherwise the saved file even if older, else the nearest real day marked with `fallbackFor` (the date asked for), never
//      the mock silently. The mock (data/mock/menu.json, marked `mock: true`) is used only when there are no real files at all.
// Cafes and markets follow the same steps (getCafes, at the end). Committed files stay the fallback. Deployed builds include data/menus, data/cafes.json and data/nutrition-cache.json through
// outputFileTracingIncludes in next.config.ts. Every caller runs inside a "use cache" scope or a route handler, so reading the
// clock here is allowed (cacheComponents).

import fs from "node:fs";
import path from "node:path";
import { cacheLife } from "next/cache";
import type { DayMenu, HallId } from "./types";
import { campusClock, daysBetween } from "./campusTime";
import { fetchLiveCafes, fetchLiveDay, type LiveCafes, type LiveDay } from "./menuLive";
import type { Cafe } from "./foodpro";
import mock from "../../data/mock/menu.json";
import { withDisplayNames } from "./dishNames";

const MENU_DIR = path.join(process.cwd(), "data", "menus");
const CAFES_FILE = path.join(process.cwd(), "data", "cafes.json");

// Cafe types live with the parser (src/lib/foodpro.ts) so the fetcher script and the server share them.
export type { Cafe, CafeCategory, CafeItem } from "./foodpro";

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

/** `read`'s result, or null if it fails or takes longer than LIVE_WAIT_MS (a slower read keeps going and serves the next caller). */
async function within<T>(read: Promise<T>, what: string): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), LIVE_WAIT_MS); });
  const done = read.then((v) => v, (err) => {
    console.warn(`[menus] live read of ${what} failed, using the saved data:`, (err as Error).message);
    return null;
  });
  try {
    return await Promise.race([done, late]);
  } finally {
    clearTimeout(timer);
  }
}

/** The site's own menus for `date`, or null if it can't answer within LIVE_WAIT_MS (or the date is outside its window). */
async function live(date: string): Promise<DayMenu[] | null> {
  if (building()) return null;
  const ahead = daysBetween(campusClock(new Date()).date, date);
  if (ahead < -1 || ahead > 10) return null;
  return (await within(liveDay(date), date))?.menus ?? null;
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

// Display names (src/lib/dishNames.ts: grill patties are burgers) apply to every menu the app reads, live or saved.
async function dayFor(date: string): Promise<DayMenu[]> {
  return withDisplayNames(await rawDayFor(date));
}

async function rawDayFor(date: string): Promise<DayMenu[]> {
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

// Cafes and markets: the same order as the halls. data/cafes.json (npm run cafes) when it was fetched less than FRESH_MS ago for
// today's campus date; otherwise the site itself (each location's menu today, or the next day it lists one: cafes close on
// weekends), through Next's cache; otherwise the saved file whatever its age.
interface SavedCafes { fetchedAt?: string; fetchedOn?: string; cafes: Cafe[] }
let savedCafes: SavedCafes | null | undefined;
function readCafes(): SavedCafes | null {
  if (savedCafes !== undefined) return savedCafes;
  try {
    const parsed = JSON.parse(fs.readFileSync(CAFES_FILE, "utf8")) as Partial<SavedCafes>;
    savedCafes = { fetchedAt: parsed.fetchedAt, fetchedOn: parsed.fetchedOn, cafes: parsed.cafes ?? [] };
  } catch (err) {
    console.warn("[menus] Could not read data/cafes.json:", err);
    savedCafes = null;
  }
  return savedCafes;
}

async function liveCafes(date: string): Promise<LiveCafes> {
  "use cache";
  cacheLife("hours");
  return fetchLiveCafes(date);
}

/** Every cafe and market (kind "cafe" or "market"), each with the menu the site lists for its menuDate. `date` is the campus
 *  date to pick menus for (default today). */
export async function getCafes(date?: string): Promise<Cafe[]> {
  const today = date ?? campusClock(new Date()).date;
  const saved = readCafes();
  if (saved?.fetchedAt && saved.fetchedOn === today && Date.now() - Date.parse(saved.fetchedAt) < FRESH_MS) return saved.cafes;
  const fresh = building() ? null : await within(liveCafes(today), `cafes for ${today}`);
  return fresh?.cafes ?? saved?.cafes ?? [];
}
