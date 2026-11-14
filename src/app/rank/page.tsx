"use client";

// Owner: Karen. This-or-that ranking screen, campus leaderboard, and college rivalry.

import { useState, useEffect } from "react";
import type { DishRank, HallId, College } from "@/lib/types";
import {
  getAllDishes,
  submitDishVote,
  getCollegeRivalry,
  recordDishSkip,
  type CollegeStanding,
} from "@/lib/rankings";
import { getWinProbability, getSmartMatchup } from "@/lib/elo";

const HALL_NAMES: Record<HallId, string> = {
  "40": "College Nine & John R. Lewis",
  "05": "Cowell & Stevenson",
  "20": "Crown & Merrill",
  "25": "Porter & Kresge",
  "30": "Rachel Carson & Oakes",
};

const COLLEGES: College[] = [
  "Cowell",
  "Stevenson",
  "Crown",
  "Merrill",
  "Porter",
  "Kresge",
  "Oakes",
  "Rachel Carson",
  "College Nine",
  "John R. Lewis",
];

export default function RankPage() {
  const [dishes, setDishes] = useState<DishRank[]>([]);
  const [matchup, setMatchup] = useState<[DishRank, DishRank] | null>(null);
  const [activeTab, setActiveTab] = useState<"vote" | "leaderboard" | "rivalry">("vote");
  const [lastVoteResult, setLastVoteResult] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userCollege, setUserCollege] = useState<College>("College Nine");
  const [rivalryStandings, setRivalryStandings] = useState<CollegeStanding[]>([]);

  // Load dishes and select first matchup with smart matchmaking
  useEffect(() => {
    async function load() {
      const list = await getAllDishes();
      setDishes(list);
      const nextMatch = getSmartMatchup(list);
      setMatchup(nextMatch);

      const rivalry = await getCollegeRivalry();
      setRivalryStandings(rivalry);
    }
    load();
  }, []);

  function handleNextMatchup(pool: DishRank[]) {
    const nextMatch = getSmartMatchup(pool);
    setMatchup(nextMatch);
  }

  async function handleVote(winner: DishRank, loser: DishRank) {
    if (isVoting) return;
    setIsVoting(true);

    const result = await submitDishVote(winner.recipeId, loser.recipeId, userCollege);
    setLastVoteResult(`+${result.winnerDelta} Elo to ${winner.name}! (+1 pt for ${userCollege})`);

    // Refresh list and rivalry board
    const updated = await getAllDishes();
    setDishes(updated);

    const updatedRivalry = await getCollegeRivalry();
    setRivalryStandings(updatedRivalry);

    setTimeout(() => {
      setLastVoteResult(null);
      handleNextMatchup(updated);
      setIsVoting(false);
    }, 750);
  }

  async function handleSkip() {
    if (!matchup) return;
    await recordDishSkip(matchup[0].recipeId, matchup[1].recipeId);
    handleNextMatchup(dishes);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pt-6 pb-28">
      {/* Header */}
      <header className="mb-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">SlugGrub Rank</h1>
        <p className="mt-1 text-xs text-neutral-500">
          UCSC Dining ranked by students. Taste is social.
        </p>

        {/* Tab Switcher */}
        <div className="mt-4 flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
          <button
            onClick={() => setActiveTab("vote")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              activeTab === "vote"
                ? "bg-white text-black shadow-sm dark:bg-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            ⚔️ Matchup
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              activeTab === "leaderboard"
                ? "bg-white text-black shadow-sm dark:bg-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            🏆 Dishes
          </button>
          <button
            onClick={() => setActiveTab("rivalry")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              activeTab === "rivalry"
                ? "bg-white text-black shadow-sm dark:bg-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            🏛️ Rivalry
          </button>
        </div>
      </header>

      {/* College Selector Bar */}
      {activeTab === "vote" && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-neutral-400 font-medium">Voting for:</span>
          <select
            value={userCollege}
            onChange={(e) => setUserCollege(e.target.value as College)}
            className="rounded-md bg-neutral-100 px-2 py-1 font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 outline-none"
          >
            {COLLEGES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Vote Feedback Toast */}
      {lastVoteResult && (
        <div className="mb-4 animate-bounce rounded-lg bg-green-500/10 py-2 text-center text-xs font-semibold text-green-600 dark:text-green-400">
          ✨ {lastVoteResult}
        </div>
      )}

      {/* View 1: This or That */}
      {activeTab === "vote" && matchup && (
        <section className="flex flex-col gap-3">
          <div className="text-center text-xs font-medium text-neutral-400">
            Which was better? Tap to vote:
          </div>

          {/* Dish A Card */}
          <button
            onClick={() => handleVote(matchup[0], matchup[1])}
            disabled={isVoting}
            className="group relative flex flex-col items-start rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-2xs transition hover:border-black/30 hover:shadow-sm active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-white/30"
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
              <span>{matchup[0].votes} votes</span>
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
            className="group relative flex flex-col items-start rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-2xs transition hover:border-black/30 hover:shadow-sm active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-white/30"
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
              <span>{matchup[1].votes} votes</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {getWinProbability(matchup[1].elo, matchup[0].elo)}% expected win
              </span>
            </div>
          </button>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="mt-2 text-center text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            Haven&apos;t tried these? Skip to next matchup →
          </button>
        </section>
      )}

      {/* View 2: Campus Dish Leaderboard */}
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

      {/* View 3: Weekly College Rivalry Board */}
      {activeTab === "rivalry" && (
        <section className="flex flex-col gap-2.5">
          <div className="mb-1 rounded-xl bg-blue-500/10 p-3 text-center text-xs text-blue-600 dark:text-blue-400">
            Votes boost your college in the weekly campus rivalry standings!
          </div>

          {rivalryStandings.map((standing, index) => {
            const isTop3 = index < 3;
            const rankBadges = ["🥇", "🥈", "🥉"];
            return (
              <div
                key={standing.college}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center font-bold text-sm">
                    {isTop3 ? rankBadges[index] : `#${index + 1}`}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{standing.college}</h3>
                      {standing.college === userCollege && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Top dish: <span className="text-neutral-600 dark:text-neutral-300">{standing.topDish}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                    {standing.score} pts
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {standing.votesCast} student votes
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
