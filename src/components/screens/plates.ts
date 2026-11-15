// Owner: Arshawn. Saved plates, on this device only. Calories are private (team rule), so they never leave the phone:
// no Firebase, no server. Every storage call is wrapped, so a private window or blocked storage just means "nothing saved".
import { useSyncExternalStore } from "react";
import type { MealPlanId, PlateLog } from "@/lib/types";
import { addToVisits, chargedSince, pruneVisits, type Visit, type VisitOutcome } from "@/lib/diningEntry";
import { localDate } from "./now";

const KEY = "sluggrub.plates.v1";
// Dining hall visits, next to the plates (2026-11-15): Slug Points come off once per entry, not per plate (src/lib/diningEntry.ts has
// the prices and the 2-hour rule). Same device-only rule as the plates.
const VISITS = "sluggrub.visits.v1";
const CHANGED = "sluggrub:plates";

export function loadPlates(): PlateLog[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function loadVisits(): Visit[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(VISITS) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => x && typeof x.startedAt === "string" && Array.isArray(x.plateIds) && Number.isFinite(x.charge)) : [];
  } catch {
    return [];
  }
}

function writeVisits(list: Visit[]) {
  try { window.localStorage.setItem(VISITS, JSON.stringify(list.slice(-300))); } catch { /* blocked storage: no visits kept */ }
}

/** Keeps the visits in step with the plates: a visit whose plates are all gone is removed, and its charge with it. */
function syncVisits(plates: PlateLog[]) {
  const all = loadVisits();
  const kept = pruneVisits(all, new Set(plates.map((p) => p?.id).filter((id): id is string => typeof id === "string")));
  if (kept.length !== all.length || kept.some((v, i) => v.plateIds.length !== all[i]?.plateIds.length)) writeVisits(kept);
}

/** Adds a plate; false if this device would not store it. */
export function savePlate(plate: PlateLog): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...loadPlates(), plate].slice(-300)));
    window.dispatchEvent(new Event(CHANGED));
    return true;
  } catch {
    return false;
  }
}

/** Saves a plate and files it into its dining hall visit (charged at the door once per visit, never per plate). The Log screen's Save. */
export function logPlate(plate: PlateLog, plan: MealPlanId | undefined): { stored: boolean; outcome: VisitOutcome | null } {
  const { visits, outcome } = addToVisits(loadVisits(), plate, plan);
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...loadPlates(), plate].slice(-300)));
    window.localStorage.setItem(VISITS, JSON.stringify(visits.slice(-300)));
  } catch {
    return { stored: false, outcome: null };
  }
  window.dispatchEvent(new Event(CHANGED));
  return { stored: true, outcome };
}

/** Example plates written by demo mode (src/components/screens/demoSeed.ts) carry this id prefix, so Leave demo removes only them. */
export const DEMO_PLATE = "demo-";

function writePlates(list: PlateLog[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-300)));
    syncVisits(list.slice(-300));
    window.dispatchEvent(new Event(CHANGED));
    return true;
  } catch {
    return false;
  }
}

/** Adds several plates at once (demo mode's example plates). */
export function savePlates(plates: PlateLog[]): boolean {
  return writePlates([...loadPlates(), ...plates]);
}

/** Removes every plate saved on this device (Settings: Start demo). */
export function clearPlates(): boolean {
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(VISITS);
    window.dispatchEvent(new Event(CHANGED));
    return true;
  } catch {
    return false;
  }
}

/** Removes only demo mode's example plates (Settings: Leave demo). */
export function removeDemoPlates(): boolean {
  const all = loadPlates();
  const keep = all.filter((p) => !(typeof p?.id === "string" && p.id.startsWith(DEMO_PLATE)));
  return keep.length === all.length || writePlates(keep);
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGED, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(CHANGED, cb); window.removeEventListener("storage", cb); };
}

// A string snapshot ("calories|plates|protein") so React sees a stable value between changes.
function todaySnapshot() {
  const today = localDate(new Date());
  const mine = loadPlates().filter((p) => p && typeof p.at === "string" && localDate(new Date(p.at)) === today);
  const protein = mine.reduce((n, p) => n + (Number(p.proteinG) || 0), 0);
  return `${Math.round(mine.reduce((n, p) => n + (Number(p.totalCalories) || 0), 0))}|${mine.length}|${Math.round(protein)}`;
}

/** Calories and protein saved today on this device; null until the page is running in the browser. */
export function useCaloriesToday(): { calories: number; plates: number; proteinG: number } | null {
  const snap = useSyncExternalStore(subscribe, todaySnapshot, () => null);
  if (snap === null) return null;
  const [calories, plates, proteinG] = snap.split("|").map(Number);
  return { calories, plates, proteinG };
}

/** Slug Points charged at the door by visits logged since `sinceIso` (when the points were entered); null on the server. */
export function useChargedSince(sinceIso: string | undefined): { total: number; visits: number } | null {
  const snap = useSyncExternalStore(subscribe, () => {
    if (!sinceIso) return "0|0";
    const c = chargedSince(loadVisits(), sinceIso);
    return `${c.total}|${c.visits}`;
  }, () => null);
  if (snap === null) return null;
  const [total, visits] = snap.split("|").map(Number);
  return { total, visits };
}
