// Owner: Ethan. Client view for Slug Points pace tracker (reads onboarding profile).

"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { computeBudgetSnapshot } from "./budgetCalc";
import { MEAL_PLANS } from "@/lib/halls";
import type { BudgetSnapshot, UserProfile } from "@/lib/types";

const PROFILE_STORAGE_KEY = "sluggrub_profile";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getProfileSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PROFILE_STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

interface BudgetClientProps {
  fallbackSnapshot: BudgetSnapshot;
}

export function BudgetClient({ fallbackSnapshot }: BudgetClientProps) {
  const rawProfile = useSyncExternalStore(
    subscribeToStorage,
    getProfileSnapshot,
    getServerSnapshot
  );

  let profile: UserProfile | null = null;
  if (rawProfile) {
    try {
      const parsed = JSON.parse(rawProfile) as Partial<UserProfile>;
      if (typeof parsed.pointsNow === "number" && parsed.plan) {
        profile = parsed as UserProfile;
      }
    } catch {
      profile = null;
    }
  }

  const snapshot = profile
    ? computeBudgetSnapshot(profile.pointsNow, profile.plan)
    : fallbackSnapshot;

  const planInfo = MEAL_PLANS.find((p) => p.id === (profile?.plan ?? "blue"));
  const planTotal = planInfo?.pointsPerQuarter ?? 1359;
  const pctRemaining = Math.min(100, Math.max(0, Math.round((snapshot.pointsLeft / planTotal) * 100)));
  const dailyAllowance = Math.round(snapshot.pointsLeft / snapshot.daysLeft);

  const paceColors = {
    "on-pace": "bg-emerald-50 text-emerald-700 border-emerald-200",
    fast: "bg-amber-50 text-amber-700 border-amber-200",
    slow: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Slug Points Pace</h1>
          <p className="text-xs text-neutral-500">
            {profile ? `${planInfo?.label ?? profile.plan} Plan` : "Sample plan — personalize in setup"}
          </p>
        </div>
        <Link
          href="/onboarding"
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          {profile ? "Edit plan" : "Set up"}
        </Link>
      </div>

      {/* Main Metric Card */}
      <div className="p-6 rounded-2xl bg-white border shadow-xs text-center space-y-3">
        <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
          Remaining Balance
        </p>
        <p className="text-5xl font-black text-neutral-900">{snapshot.pointsLeft}</p>
        <p className="text-xs text-neutral-500">
          {snapshot.daysLeft} days left · ~{dailyAllowance} pts/day available
        </p>

        {/* Pace Progress Bar */}
        <div className="pt-2">
          <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${pctRemaining}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {pctRemaining}% of {planTotal} quarterly points left
          </p>
        </div>

        <div
          className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold border ${paceColors[snapshot.pace]}`}
        >
          {snapshot.pace === "on-pace" && "✓ On Pace"}
          {snapshot.pace === "fast" && "⚠ Spending Fast - Pace Down"}
          {snapshot.pace === "slow" && "★ Point Surplus - Treat Yourself"}
        </div>

        {snapshot.pace === "fast" && snapshot.runOutDate && (
          <p className="text-xs text-amber-700">
            At your current pace, points may run out around {snapshot.runOutDate}.
          </p>
        )}
        {snapshot.pace === "slow" && snapshot.leftoverAtQuarterEnd !== undefined && (
          <p className="text-xs text-blue-700">
            Projected ~{snapshot.leftoverAtQuarterEnd} points left at quarter end.
          </p>
        )}
      </div>

      {/* Breakdown Guide */}
      <div className="p-4 rounded-xl border bg-neutral-50 text-xs space-y-2 text-neutral-600">
        <p className="font-semibold text-neutral-800">UCSC Point Reference:</p>
        <div className="flex justify-between">
          <span>Dining Hall Meal</span>
          <span className="font-medium">~12 - 14 pts</span>
        </div>
        <div className="flex justify-between">
          <span>Cafe Sandwich / Drink</span>
          <span className="font-medium">~8 - 10 pts</span>
        </div>
        <div className="flex justify-between">
          <span>Market Snack</span>
          <span className="font-medium">~3 - 5 pts</span>
        </div>
      </div>
    </div>
  );
}
