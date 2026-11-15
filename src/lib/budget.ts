// Owner: Ethan. Slug Points pace for everyone else.
// Keep getBudgetSnapshot() name and return type stable; others call it.

import { cacheLife } from "next/cache";
import { computeBudgetSnapshot } from "../app/budget/budgetCalc";
import type { BudgetSnapshot } from "./types";

export async function getBudgetSnapshot(): Promise<BudgetSnapshot> {
  "use cache";
  cacheLife("hours");

  return computeBudgetSnapshot(1120, "blue", new Date());
}
