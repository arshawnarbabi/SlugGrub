// Owner: Ethan. Menu data for everyone else.
// Returns fake data from data/mock/menu.json until the real fetcher saves to data/menus/.
// Keep these function names and return types stable; others call them.

import type { DayMenu, HallId } from "./types";
import mock from "../../data/mock/menu.json";

const MOCK = mock.menus as DayMenu[];

export async function getMenu(date: string, hallId: HallId): Promise<DayMenu | null> {
  return MOCK.find((m) => m.hallId === hallId) ?? null; // TODO (Ethan): real data, by date
}

export async function getAllMenus(date: string): Promise<DayMenu[]> {
  return MOCK; // TODO (Ethan): real data, by date
}
