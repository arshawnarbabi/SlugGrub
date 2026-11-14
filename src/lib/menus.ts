// Owner: Ethan. Menu data for everyone else.
// Returns fake data from data/mock/menu.json until the real fetcher saves to data/menus/.
// Keep getMenu() and getAllMenus() names and return types stable; others call them.

import type { DayMenu, HallId } from "./types";
import mock from "../../data/mock/menu.json";

const MOCK = mock.menus as DayMenu[];

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
}

async function loadMenuFile(date: string): Promise<DayMenu[] | null> {
  // Only read from filesystem in Node.js server environment
  if (typeof window !== "undefined") return null;

  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.join(process.cwd(), "data", "menus", `${date}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : parsed.menus ?? null;
    }
  } catch (err) {
    console.warn(`[menus] Could not read menu file for ${date}:`, err);
  }
  return null;
}

export async function getMenu(date: string, hallId: HallId): Promise<DayMenu | null> {
  const realMenus = await loadMenuFile(date);
  if (realMenus) {
    const match = realMenus.find((m) => m.hallId === hallId);
    if (match) return match;
  }
  // Fall back to mock data so other features don't break
  return MOCK.find((m) => m.hallId === hallId) ?? null;
}

export async function getAllMenus(date: string): Promise<DayMenu[]> {
  const realMenus = await loadMenuFile(date);
  if (realMenus && realMenus.length > 0) {
    return realMenus;
  }
  return MOCK;
}

export async function getCafes(): Promise<Cafe[]> {
  if (typeof window !== "undefined") return [];

  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.join(process.cwd(), "data", "cafes.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content) as { cafes?: Cafe[] };
      return parsed.cafes ?? [];
    }
  } catch (err) {
    console.warn("[menus] Could not read data/cafes.json:", err);
  }
  return [];
}
