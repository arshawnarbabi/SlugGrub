// Owner: Ethan. Pure Slug Points pace calculation shared by server & client.

import { MEAL_PLANS } from "../../lib/halls";
import type { BudgetSnapshot, MealPlanId } from "../../lib/types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const QUARTER_START = new Date("2026-09-24T00:00:00");
const QUARTER_END = new Date("2026-12-12T00:00:00");
const TOTAL_QUARTER_DAYS = Math.max(
  1,
  Math.round((QUARTER_END.getTime() - QUARTER_START.getTime()) / MS_PER_DAY)
);

export function computeBudgetSnapshot(
  pointsLeft: number,
  planId: MealPlanId = "blue",
  now: Date = new Date()
): BudgetSnapshot {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = QUARTER_END.getTime() - todayStart.getTime();
  const daysLeft = Math.max(1, Math.ceil(diffTime / MS_PER_DAY));
  const elapsedDays = Math.max(1, TOTAL_QUARTER_DAYS - daysLeft);

  const planTotal =
    MEAL_PLANS.find((p) => p.id === planId)?.pointsPerQuarter ?? 1359;
  const expectedPointsLeft = planTotal * (daysLeft / TOTAL_QUARTER_DAYS);

  const safePoints = Math.max(0, pointsLeft);
  const spentSoFar = Math.max(0, planTotal - safePoints);
  const avgDailySpend = spentSoFar / elapsedDays;

  let pace: BudgetSnapshot["pace"] = "on-pace";
  let runOutDate: string | undefined;
  let leftoverAtQuarterEnd: number | undefined;

  if (safePoints === 0 || safePoints < expectedPointsLeft * 0.85) {
    pace = "fast";
    if (avgDailySpend > 0) {
      const daysUntilEmpty = Math.floor(safePoints / avgDailySpend);
      if (daysUntilEmpty < daysLeft) {
        const emptyDate = new Date(todayStart.getTime() + daysUntilEmpty * MS_PER_DAY);
        runOutDate = emptyDate.toISOString().slice(0, 10);
      }
    }
  } else if (safePoints > expectedPointsLeft * 1.15) {
    pace = "slow";
    leftoverAtQuarterEnd = Math.max(
      0,
      Math.round(safePoints - avgDailySpend * daysLeft)
    );
  }

  return {
    pointsLeft: safePoints,
    daysLeft,
    pace,
    runOutDate,
    leftoverAtQuarterEnd,
  };
}
