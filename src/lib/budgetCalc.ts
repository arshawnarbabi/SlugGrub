// Owner: Ethan. Pure Slug Points pace math, shared by the server (getBudgetSnapshot) and the Budget screen.
// All dates are campus dates (Pacific time), so the server's UTC clock never shifts a day.

import { MEAL_PLANS } from "./halls";
import { addDays, campusClock, daysBetween } from "./campusTime";
import type { BudgetSnapshot, MealPlanId } from "./types";

// Fall quarter 2026: instruction starts Thu Sep 24; points are meant to last through finals (ends Fri Dec 11).
export const QUARTER_START = "2026-09-24";
export const QUARTER_END = "2026-12-12"; // first day after the quarter
const TOTAL_DAYS = daysBetween(QUARTER_START, QUARTER_END);

export const planTotal = (planId: MealPlanId) => MEAL_PLANS.find((p) => p.id === planId)?.pointsPerQuarter ?? MEAL_PLANS[0].pointsPerQuarter;

export interface PaceDetail extends BudgetSnapshot {
  planTotal: number;
  today: string; // campus date the numbers are for
  totalDays: number; // days in the quarter
  elapsedDays: number; // days used so far
  spentPerDay: number; // average points a day so far
  perDayToFinish: number; // points a day that would last exactly to the end
  idealLeft: number; // points you'd have now at an even pace
  estimated: boolean; // true when the points were entered on an earlier day and aged to today at the student's own pace
  enteredPoints: number;
  enteredOn: string; // campus date the points were entered
}

function elapsed(date: string) {
  return Math.min(TOTAL_DAYS, Math.max(0, daysBetween(QUARTER_START, date)));
}

/** Pace from the points a student had on `enteredOn`, aged to `now` at their own average so far. */
export function computePace(points: number, planId: MealPlanId, now: Date, enteredOn?: string): PaceDetail {
  const today = campusClock(now).date;
  const entered = enteredOn && enteredOn < today ? enteredOn : today;
  const total = planTotal(planId);
  const enteredPoints = Math.max(0, Math.round(points));

  // their average daily spend as of the day they entered the number (rolled-over points above the plan count as unspent)
  const rate = Math.max(0, total - enteredPoints) / Math.max(1, elapsed(entered));
  const sinceEntered = Math.max(0, daysBetween(entered, today));
  const pointsLeft = Math.max(0, Math.round(enteredPoints - rate * sinceEntered));

  const elapsedDays = elapsed(today);
  const daysLeft = Math.max(1, TOTAL_DAYS - elapsedDays);
  const spentPerDay = Math.max(0, total - pointsLeft) / Math.max(1, elapsedDays);
  const idealLeft = Math.round(total * (daysLeft / TOTAL_DAYS));

  let pace: BudgetSnapshot["pace"] = "on-pace";
  if (pointsLeft === 0 || pointsLeft < idealLeft * 0.85) pace = "fast";
  else if (pointsLeft > idealLeft * 1.15) pace = "slow";

  // when they run out at this pace, or what is left at the end
  let runOutDate: string | undefined;
  let leftoverAtQuarterEnd: number | undefined;
  const daysUntilEmpty = spentPerDay > 0 ? Math.floor(pointsLeft / spentPerDay) : Infinity;
  if (daysUntilEmpty < daysLeft) runOutDate = addDays(today, daysUntilEmpty);
  else leftoverAtQuarterEnd = Math.max(0, Math.round(pointsLeft - spentPerDay * daysLeft));

  return {
    pointsLeft, daysLeft, pace, runOutDate, leftoverAtQuarterEnd, planTotal: total,
    today, totalDays: TOTAL_DAYS, elapsedDays, spentPerDay, perDayToFinish: pointsLeft / daysLeft, idealLeft,
    estimated: entered !== today && sinceEntered > 0, enteredPoints, enteredOn: entered,
  };
}

/** The shared BudgetSnapshot shape (Today's card). Same name and signature as before. */
export function computeBudgetSnapshot(pointsLeft: number, planId: MealPlanId = "blue", now: Date = new Date(), enteredOn?: string): BudgetSnapshot {
  const p = computePace(pointsLeft, planId, now, enteredOn);
  return { pointsLeft: p.pointsLeft, daysLeft: p.daysLeft, pace: p.pace, runOutDate: p.runOutDate, leftoverAtQuarterEnd: p.leftoverAtQuarterEnd, planTotal: p.planTotal };
}

/** The Monday of the week a date falls in, for "runs out the week of Dec 1". */
export function weekOf(iso: string): string {
  const wd = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return addDays(iso, -((wd + 6) % 7));
}
