// Owner: Ethan. Menu data for everyone else. Real menus come from data/menus/YYYY-MM-DD.json (npm run menus).
// Keep getMenu() and getAllMenus() names and return types stable; others call them.
//
// A date with no file gets the nearest real day instead, marked with `fallbackFor` (the date that was asked for), never the mock
// silently. The mock (data/mock/menu.json, marked `mock: true`) is used only when there are no real files at all.
// Deployed builds include data/menus and data/cafes.json through outputFileTracingIncludes in next.config.ts.

import fs from "node:fs";
import path from "node:path";
import type { DayMenu, HallId } from "./types";
import { daysBetween } from "./campusTime";
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

// Parsed files stay in memory for the life of the server process (each day's file is a few hundred KB).
const files = new Map<string, DayMenu[] | null>();
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

function readDay(date: string): DayMenu[] | null {
  if (files.has(date)) return files.get(date)!;
  let menus: DayMenu[] | null = null;
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(MENU_DIR, `${date}.json`), "utf8"));
    menus = Array.isArray(parsed) ? parsed : parsed.menus ?? null;
  } catch (err) {
    console.warn(`[menus] Could not read data/menus/${date}.json:`, err);
  }
  files.set(date, menus);
  return menus;
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

function dayFor(date: string): DayMenu[] {
  const real = nearestMenuDate(date);
  const menus = real ? readDay(real) : null;
  if (menus && menus.length) return real === date ? menus : menus.map((m) => ({ ...m, fallbackFor: date }));
  return (mock.menus as DayMenu[]).map((m) => ({ ...m, mock: true, fallbackFor: date }));
}

export async function getMenu(date: string, hallId: HallId): Promise<DayMenu | null> {
  return dayFor(date).find((m) => m.hallId === hallId) ?? null;
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
