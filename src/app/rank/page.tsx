"use client";

// Owner: Karen. This-or-that ranking screen and campus leaderboard.

import { useState, useEffect } from "react";
import type { DishRank, HallId } from "@/lib/types";
import { getAllDishes, submitDishVote } from "@/lib/rankings";
import { getWinProbability } from "@/lib/elo";

const HALL_NAMES: Record<HallId, string> = {
  "40": "College Nine & John R. Lewis",
  "05": "Cowell & Stevenson",
  "20": "Crown & Merrill",
  "25": "Porter & Kresge",
  "30": "Rachel Carson & Oakes",
};

export default function RankPage() {
  const [dishes, setDishes] = useState<DishRank[]>([]);
  const [matchup, setMatchup] = useState<[DishRank, DishRank] | null>(null);
  const [activeTab, setActiveTab] = useState<"vote" | "leaderboard">("vote");
  const [lastVoteResult, setLastVoteResult] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Load dishes and select first matchup
  useEffect(() => {
    async function load() {
      const list = await getAllDishes();
      setDishes(list);
      pickRandomMatchup(list);
    }
    load();
  }, []);

  function pickRandomMatchup(list: DishRank[]) {
    if (list.length < 2) return;
    const idx1 = Math.floor(Math.random() * list.length);
    let idx2 = Math.floor(Math.random() * list.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * list.length);
    }
    setMatchup([list[idx1], list[idx2]]);
  }

  async function handleVote(winner: DishRank, loser: DishRank) {
    if (isVoting) return;
    setIsVoting(true);

    const result = await submitDishVote(winner.recipeId, loser.recipeId);
    setLastVoteResult(`+${result.winnerDelta} Elo to ${winner.name}!`);

    // Refresh list and pick next pair
    const updated = await getAllDishes();
    setDishes(updated);

    setTimeout(() => {
      setLastVoteResult(null);
      pickRandomMatchup(updated);
      setIsVoting(false);
    }, 800);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pt-6 pb-28">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">SlugGrub Rank</h1>
        <p className="mt-1 text-xs text-neutral-500">
          UCSC Dining ranked by students. Taste is social.
        </p>

        {/* Tab Switcher */}
        <div className="mt-4 flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
          <button
            onClick={() => setActiveTab("vote")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === "vote"
                ? "bg-white text-black shadow-sm dark:bg-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            ⚔️ This or That
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === "leaderboard"
                ? "bg-white text-black shadow-sm dark:bg-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            🏆 Top Dishes
          </button>
        </div>
      </header>

      {/* Vote Feedback Toast */}
      {lastVoteResult && (
        <div className="mb-4 animate-bounce rounded-lg bg-green-500/10 py-2 text-center text-xs font-semibold text-green-600 dark:text-green-400">
          ✨ {lastVoteResult}
        </div>
      )}

      {/* View: This or That */}
      {activeTab === "vote" && matchup && (
        <section className="flex flex-col gap-4">
          <div className="text-center text-xs font-medium text-neutral-400">
            Which was better? Tap to vote:
          </div>

          {/* Dish A Card */}
          <button
            onClick={() => handleVote(matchup[0], matchup[1])}
            disabled={isVoting}
            className="group relative flex flex-col items-start rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:border-black/30 hover:shadow-md active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-white/30"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-400">
                {HALL_NAMES[matchup[0].hallId]}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                ⭐ {matchup[0].elo} Elo
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold group-hover:underline">
              {matchup[0].name}
            </h2>
            <div className="mt-3 flex w-full items-center justify-between text-xs text-neutral-500">
              <span>{matchup[0].votes} votes so far</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {getWinProbability(matchup[0].elo, matchup[1].elo)}% expected win
              </span>
            </div>
          </button>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <span className="rounded-full bg-neutral-200 px-3 py-1 text-[11px] font-extrabold tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              VS
            </span>
          </div>

          {/* Dish B Card */}
          <button
            onClick={() => handleVote(matchup[1], matchup[0])}
            disabled={isVoting}
            className="group relative flex flex-col items-start rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:border-black/30 hover:shadow-md active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-white/30"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-400">
                {HALL_NAMES[matchup[1].hallId]}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                ⭐ {matchup[1].elo} Elo
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold group-hover:underline">
              {matchup[1].name}
            </h2>
            <div className="mt-3 flex w-full items-center justify-between text-xs text-neutral-500">
              <span>{matchup[1].votes} votes so far</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {getWinProbability(matchup[1].elo, matchup[0].elo)}% expected win
              </span>
            </div>
          </button>

          {/* Skip Button */}
          <button
            onClick={() => pickRandomMatchup(dishes)}
            className="mt-2 text-center text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            Haven&apos;t tried these? Skip to next matchup →
          </button>
        </section>
      )}

      {/* View: Campus Leaderboard */}
      {activeTab === "leaderboard" && (
        <section className="flex flex-col gap-2">
          {dishes.map((dish, index) => {
            const rankBadges = ["🥇", "🥈", "🥉"];
            const isTop3 = index < 3;
            return (
              <div
                key={dish.recipeId}
                className={`flex items-center justify-between rounded-xl border p-3.5 transition ${
                  index === 0
                    ? "border-amber-300 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-950/20"
                    : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center font-bold text-sm">
                    {isTop3 ? rankBadges[index] : `#${index + 1}`}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{dish.name}</h3>
                    <p className="text-[11px] text-neutral-400">
                      {HALL_NAMES[dish.hallId]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                    {dish.elo}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {dish.votes} votes
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
