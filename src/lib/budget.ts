// Owner: Ethan. Slug Points pace for everyone else.
// Keep getBudgetSnapshot() name and return type stable; others call it.
//
// The student's points live on their phone (src/lib/profile.ts, localStorage), so the server cannot read them. Pass the saved
// profile in when you have it (a client component can call computeBudgetSnapshot from ./budgetCalc directly). With no profile,
// this returns example numbers marked source: "demo".

import { cacheLife } from "next/cache";
import { computeBudgetSnapshot } from "./budgetCalc";
import type { BudgetSnapshot, UserProfile } from "./types";

const DEMO = { plan: "gold" as const, pointsNow: 1120 };

export async function getBudgetSnapshot(profile?: Pick<UserProfile, "plan" | "pointsNow"> & { savedAt?: string }): Promise<BudgetSnapshot> {
  "use cache";
  cacheLife("hours");
  const now = new Date();
  if (!profile) return { ...computeBudgetSnapshot(DEMO.pointsNow, DEMO.plan, now), source: "demo" };
  const enteredOn = profile.savedAt
    ? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date(profile.savedAt))
    : undefined;
  return { ...computeBudgetSnapshot(profile.pointsNow, profile.plan, now, enteredOn), source: "profile" };
}
