// Owner: Arshawn. Saved plates, on this device only. Calories are private (team rule), so they never leave the phone:
// no Firebase, no server. Every storage call is wrapped, so a private window or blocked storage just means "nothing saved".
import { useSyncExternalStore } from "react";
import type { PlateLog } from "@/lib/types";
import { localDate } from "./now";

const KEY = "sluggrub.plates.v1";
const CHANGED = "sluggrub:plates";

export function loadPlates(): PlateLog[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
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

/** Example plates written by demo mode (src/components/screens/demoSeed.ts) carry this id prefix, so Leave demo removes only them. */
export const DEMO_PLATE = "demo-";

function writePlates(list: PlateLog[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-300)));
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

// A string snapshot ("calories|plates") so React sees a stable value between changes.
function todaySnapshot() {
  const today = localDate(new Date());
  const mine = loadPlates().filter((p) => p && typeof p.at === "string" && localDate(new Date(p.at)) === today);
  return `${Math.round(mine.reduce((n, p) => n + (Number(p.totalCalories) || 0), 0))}|${mine.length}`;
}

/** Calories saved today on this device; null until the page is running in the browser. */
export function useCaloriesToday(): { calories: number; plates: number } | null {
  const snap = useSyncExternalStore(subscribe, todaySnapshot, () => null);
  if (snap === null) return null;
  const [calories, plates] = snap.split("|").map(Number);
  return { calories, plates };
}
