// Owner: Ethan. The student's onboarding answers, on this device only (localStorage key "sluggrub.profile").
// Budget, Halls and Today read it; the rankings code reads `college` from the same key. Every storage call is wrapped, so a
// private window or blocked storage just means "no profile yet". Client only: never call these during server render.
import { useSyncExternalStore } from "react";
import type { College, HallId, MealPlanId, UserProfile } from "./types";

export const PROFILE_KEY = "sluggrub.profile";
const CHANGED = "sluggrub:profile";

/** The optional daily calorie goal (onboarding's goal step, 2026-11-15). Private: it stays in this key on this phone, never sent to
 *  the server or Firebase, never shown to anyone else. `calories` is the goal; the body stats are kept only to refill the step. */
export interface CalorieGoal {
  calories: number;
  heightIn?: number; // total inches
  weightLb?: number;
  age?: number;
  sex?: "male" | "female" | "unsaid"; // for the formula only
  activity?: "light" | "moderate" | "very";
  direction?: "lose" | "maintain" | "gain"; // 2026-11-15; goals saved before it have none and read as maintain
  typed?: boolean; // true when the student typed their own number instead of the formula's
}

/** UserProfile plus when it was saved (ISO), so points entered days ago can be aged to today. */
export interface SavedProfile extends UserProfile {
  savedAt: string;
  name?: string; // from Google sign-in, if the student used it
  uid?: string;
  goal?: CalorieGoal; // optional; profiles saved before 2026-11-15 have none
}

/** A goal worth showing: a whole number of calories in a sane range. */
export const goalCalories = (p: { goal?: CalorieGoal } | null | undefined): number | null => {
  const c = p?.goal?.calories;
  return typeof c === "number" && Number.isFinite(c) && c >= 800 && c <= 8000 ? Math.round(c) : null;
};

const PLANS: MealPlanId[] = ["blue", "gold", "banana-slug", "unlimited"];
const HALL_IDS: HallId[] = ["40", "05", "20", "25", "30"];
const COLLEGES: College[] = ["Cowell", "Stevenson", "Crown", "Merrill", "Porter", "Kresge", "Oakes", "Rachel Carson", "College Nine", "John R. Lewis"];

function valid(v: unknown): v is SavedProfile {
  const p = v as SavedProfile;
  return !!p && PLANS.includes(p.plan) && HALL_IDS.includes(p.usualHall) && COLLEGES.includes(p.college)
    && Number.isFinite(p.pointsNow) && typeof p.savedAt === "string";
}

export function getProfile(): SavedProfile | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "null");
    return valid(v) ? v : null;
  } catch {
    return null;
  }
}

/** Saves the profile (savedAt is set now unless given). False if this device would not store it. */
export function saveProfile(p: UserProfile & { savedAt?: string; name?: string; uid?: string; goal?: CalorieGoal }): boolean {
  try {
    const out: SavedProfile = { ...p, pointsNow: Math.max(0, Math.round(p.pointsNow)), savedAt: p.savedAt ?? new Date().toISOString() };
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(out));
    window.dispatchEvent(new Event(CHANGED));
    return true;
  } catch {
    return false;
  }
}

/** Sets or clears only the calorie goal, keeping everything else (and savedAt, so entered points are not re-dated). Today's "Set a goal". */
export function saveGoal(goal: CalorieGoal | undefined): boolean {
  const p = getProfile();
  if (!p) return false;
  const next: SavedProfile = { ...p };
  if (goal) next.goal = goal; else delete next.goal;
  return saveProfile(next);
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGED, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(CHANGED, cb); window.removeEventListener("storage", cb); };
}
const snapshot = () => {
  try { return window.localStorage.getItem(PROFILE_KEY) ?? ""; } catch { return ""; }
};

/** The saved profile in a component: undefined while rendering on the server or before hydration, null when none is saved. */
export function useProfile(): SavedProfile | null | undefined {
  const raw = useSyncExternalStore(subscribe, snapshot, () => undefined);
  if (raw === undefined) return undefined;
  try {
    const v = JSON.parse(raw || "null");
    return valid(v) ? v : null;
  } catch {
    return null;
  }
}
