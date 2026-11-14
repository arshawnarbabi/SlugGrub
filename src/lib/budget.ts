// Owner: Ethan. Slug Points pace for everyone else.
// Returns fake data until onboarding saves a real profile. Keep names and return types stable.

import type { BudgetSnapshot } from "./types";

export async function getBudgetSnapshot(): Promise<BudgetSnapshot> {
  // TODO (Ethan): from the user's plan, current points and days left in the quarter
  return { pointsLeft: 1120, daysLeft: 27, pace: "on-pace" };
}
