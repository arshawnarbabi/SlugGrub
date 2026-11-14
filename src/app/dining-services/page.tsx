"use client";

// Owner: Karen. Dining services view: loved and skipped dishes by hall.
// Provides actionable menu and recipe insights for UCSC Dining Hall managers.

import { useState, useEffect } from "react";
import type { HallId } from "@/lib/types";
import { getDiningServicesInsights, type DiningServicesReport } from "@/lib/rankings";
import { HALLS } from "@/lib/halls";

export default function DiningServicesPage() {
  const [selectedHall, setSelectedHall] = useState<HallId | "all">("all");
  const [report, setReport] = useState<DiningServicesReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const hallArg = selectedHall === "all" ? undefined : selectedHall;
      const data = await getDiningServicesInsights(hallArg);
      setReport(data);
      setLoading(false);
    }
    load();
  }, [selectedHall]);

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pt-6 pb-28">
      {/* Header */}
      <header className="mb-5 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          🍽️ UCSC Dining Services Dashboard
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Dish Performance</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Student taste analytics: Loved vs. Skipped dishes to optimize menus & cut waste.
        </p>
      </header>

      {/* Hall Filter */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedHall("all")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            selectedHall === "all"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          All Halls
        </button>
        {HALLS.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHall(h.id)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              selectedHall === h.id
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {h.short}
          </button>
        ))}
      </div>

      {loading || !report ? (
        <div className="py-12 text-center text-xs text-neutral-400">
          Analyzing student votes...
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Average Rating
              </span>
              <div className="mt-1 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {report.averageElo} <span className="text-xs font-normal text-neutral-400">Elo</span>
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Student Votes
              </span>
              <div className="mt-1 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {report.totalVotes}
              </div>
            </div>
          </div>

          {/* Section: Loved Dishes */}
          <section className="rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/10">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                <span>❤️</span> Loved by Students
              </h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                High Win Rate
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {report.lovedDishes.map((dish) => (
                <div
                  key={dish.recipeId}
                  className="flex items-center justify-between rounded-xl bg-white p-3 shadow-2xs dark:bg-neutral-900"
                >
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {dish.name}
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      ⭐ {dish.elo} Elo · {dish.votes} votes
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {dish.winRate}% win
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Skipped / Underperforming Dishes */}
          <section className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-4 dark:border-amber-900/40 dark:bg-amber-950/10">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-amber-800 dark:text-amber-300">
                <span>⚠️</span> Underperforming / Skipped
              </h2>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                Review Recipe
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {report.skippedDishes.map((dish) => (
                <div
                  key={dish.recipeId}
                  className="flex items-center justify-between rounded-xl bg-white p-3 shadow-2xs dark:bg-neutral-900"
                >
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {dish.name}
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      ⭐ {dish.elo} Elo · {dish.skips} skips
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {dish.winRate}% win
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recommendations for Dining Services */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              💡 Menu Recommendations
            </h2>
            <ul className="flex flex-col gap-2 text-xs text-neutral-700 dark:text-neutral-300">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}