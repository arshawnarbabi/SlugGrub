// Owner: Arshawn. What a dining hall charges at the door, in Slug Points, and how SlugGrub groups logged plates into visits.
// UCSC charges once per entry, not per plate (his question 2026-11-15: "how would it know how many slug points to take off becaus it's
// per entering the dining hall now per plate"). One home for the prices: change them here when dining changes them.
//
// Source: https://dining.ucsc.edu/plans-pricing/entry/ ("Entry Prices", academic year 2026-27), checked 2026-11-15.
// Slug Points column: breakfast 13.65, lunch 14.60, dinner 15.60, late night 14.60. Unlimited meal plans: "Included" (nothing at the
// door). Brunch is not listed on that page.
import type { HallId, MealName, MealPlanId } from "./types";

export const ENTRY_PRICES_SOURCE = "https://dining.ucsc.edu/plans-pricing/entry/";
export const ENTRY_PRICES_CHECKED = "2026-11-15";

/** Slug Points charged at the door for each meal period (2026-27). */
export const ENTRY_PRICE: Record<MealName, number> = {
  Breakfast: 13.65,
  Lunch: 14.6,
  Dinner: 15.6,
  "Late Night": 14.6,
};

/** Plates at the same hall within this long of a visit's first plate are the same visit (one charge). */
export const VISIT_WINDOW_MS = 2 * 60 * 60 * 1000;

/** What the door costs this student for a meal: nothing on an unlimited plan. */
export function entryCharge(meal: MealName, plan: MealPlanId | undefined): number {
  return plan === "unlimited" ? 0 : ENTRY_PRICE[meal] ?? 0;
}

/** One trip into a dining hall: its first plate sets the hall, the time and the meal it is charged at. */
export interface Visit {
  id: string;
  hallId: HallId;
  startedAt: string; // ISO, the first plate's time
  meal: MealName; // the meal being served when the visit started (its first plate's meal)
  charge: number; // Slug Points charged at the door (0 on an unlimited plan)
  plateIds: string[];
}

export type VisitOutcome =
  | { kind: "charged"; visit: Visit } // first plate of a new visit, charged at the door
  | { kind: "same"; visit: Visit } // a later plate in a visit already charged
  | { kind: "unlimited"; visit: Visit }; // a new visit on an unlimited plan: nothing charged

/** The visit a new plate belongs to: the latest visit at the same hall whose first plate was within 2 hours before it. */
export function visitFor(visits: Visit[], plate: { at: string; hallId: HallId }): Visit | undefined {
  const t = Date.parse(plate.at);
  return [...visits].reverse().find((v) => {
    const start = Date.parse(v.startedAt);
    return v.hallId === plate.hallId && t >= start && t - start <= VISIT_WINDOW_MS;
  });
}

/** Adds a plate to the visits: joins its visit, or starts a new one charged at the door. Pure; returns the new list and what happened. */
export function addToVisits(visits: Visit[], plate: { id: string; at: string; hallId: HallId; meal: MealName }, plan: MealPlanId | undefined): { visits: Visit[]; outcome: VisitOutcome } {
  const open = visitFor(visits, plate);
  if (open) {
    const visit = { ...open, plateIds: [...open.plateIds, plate.id] };
    return { visits: visits.map((v) => (v.id === open.id ? visit : v)), outcome: { kind: "same", visit } };
  }
  const charge = entryCharge(plate.meal, plan);
  const visit: Visit = { id: `visit-${plate.id}`, hallId: plate.hallId, startedAt: plate.at, meal: plate.meal, charge, plateIds: [plate.id] };
  return { visits: [...visits, visit], outcome: { kind: charge > 0 ? "charged" : "unlimited", visit } };
}

/** Drops plates that no longer exist; a visit left with no plates is removed, and its charge with it. Pure. */
export function pruneVisits(visits: Visit[], plateIds: Set<string>): Visit[] {
  return visits
    .map((v) => ({ ...v, plateIds: v.plateIds.filter((id) => plateIds.has(id)) }))
    .filter((v) => v.plateIds.length > 0);
}

/** Slug Points charged at the door by visits that started at or after `sinceIso` (when the student entered their points). */
export function chargedSince(visits: Visit[], sinceIso: string): { total: number; visits: number } {
  const since = Date.parse(sinceIso);
  const mine = visits.filter((v) => Date.parse(v.startedAt) >= since && v.charge > 0);
  return { total: Math.round(mine.reduce((n, v) => n + v.charge, 0) * 100) / 100, visits: mine.length };
}

/** "15.60" */
export const pointsText = (n: number) => n.toFixed(2);
