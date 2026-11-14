"use client";

// Owner: Karen. Live QR vote page for judges and demo audience.
// Connects live votes directly into the Elo ranking and college rivalry algorithm.

import { useState, useEffect } from "react";
import type { DishRank, College } from "@/lib/types";
import { getAllDishes, submitDishVote, getCollegeRivalry, type CollegeStanding } from "@/lib/rankings";
import { getWinProbability, getSmartMatchup } from "@/lib/elo";
import Link from "next/link";

const COLLEGES: College[] = [
  "College Nine",
  "John R. Lewis",
  "Cowell",
  "Stevenson",
  "Crown",
  "Merrill",
  "Porter",
  "Kresge",
  "Oakes",
  "Rachel Carson",
];

export default function LiveVotePage() {
  const [dishes, setDishes] = useState<DishRank[]>([]);
  const [matchup, setMatchup] = useState<[DishRank, DishRank] | null>(null);
  const [judgeCollege, setJudgeCollege] = useState<College>("Crown");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const [votesCastCount, setVotesCastCount] = useState(0);
  const [rivalryStandings, setRivalryStandings] = useState<CollegeStanding[]>([]);

  useEffect(() => {
    async function init() {
      const all = await getAllDishes();
      setDishes(all);
      const match = getSmartMatchup(all);
      setMatchup(match);

      const rivalry = await getCollegeRivalry();
      setRivalryStandings(rivalry.slice(0, 3));
    }
    init();
  }, []);

  async function handleJudgeVote(winner: DishRank, loser: DishRank) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const result = await submitDishVote(winner.recipeId, loser.recipeId, judgeCollege);
    setVotesCastCount((prev) => prev + 1);
    setVoteMessage(
      `🎉 Vote logged! +${result.winnerDelta} Elo to ${winner.name}! (+1 pt to ${judgeCollege})`
    );

    const updated = await getAllDishes();
    setDishes(updated);

    const updatedRivalry = await getCollegeRivalry();
    setRivalryStandings(updatedRivalry.slice(0, 3));

    setTimeout(() => {
      setVoteMessage(null);
      setMatchup(getSmartMatchup(updated));
      setIsSubmitting(false);
    }, 900);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pt-6 pb-28">
      {/* Header */}
      <header className="mb-5 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
          ⚡ Live Judge / Demo Voting
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Judge This Dish</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Your vote feeds live into the UCSC Elo ranking & college rivalry algorithm.
        </p>
      </header>

      {/* Judge Affiliation Selector */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold">Judge / Guest College</span>
          <span className="text-[10px] text-neutral-400">Your vote boosts this college</span>
        </div>
        <select
          value={judgeCollege}
          onChange={(e) => setJudgeCollege(e.target.value as College)}
          className="rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 outline-none"
        >
          {COLLEGES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Vote Feedback Toast */}
      {voteMessage && (
        <div className="mb-4 animate-bounce rounded-xl bg-green-500/15 p-3 text-center text-xs font-bold text-green-700 dark:text-green-300">
          {voteMessage}
        </div>
      )}

      {/* Live Matchup Cards */}
      {matchup && (
        <section className="flex flex-col gap-3">
          <div className="text-center text-xs font-medium text-neutral-400">
            Tap the plate you’d rather have right now:
          </div>

          {/* Dish A */}
          <button
            onClick={() => handleJudgeVote(matchup[0], matchup[1])}
            disabled={isSubmitting}
            className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-2xs transition hover:border-black/30 hover:shadow-sm active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-white/30"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-400">Option 1</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                ⭐ {matchup[0].elo} Elo
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold group-hover:underline">
              {matchup[0].name}
            </h2>
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
              <span>{matchup[0].votes} student votes</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {getWinProbability(matchup[0].elo, matchup[1].elo)}% expected win
              </span>
            </div>
          </button>

          {/* VS */}
          <div className="flex items-center justify-center">
            <span className="rounded-full bg-neutral-200 px-3 py-1 text-[10px] font-extrabold tracking-widest text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              VS
            </span>
          </div>

          {/* Dish B */}
          <button
            onClick={() => handleJudgeVote(matchup[1], matchup[0])}
            disabled={isSubmitting}
            className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-2xs transition hover:border-black/30 hover:shadow-sm active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-white/30"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-400">Option 2</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                ⭐ {matchup[1].elo} Elo
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold group-hover:underline">
              {matchup[1].name}
            </h2>
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
              <span>{matchup[1].votes} student votes</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {getWinProbability(matchup[1].elo, matchup[0].elo)}% expected win
              </span>
            </div>
          </button>
        </section>
      )}

      {/* Live Rivalry Snippet */}
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            📊 Live Rivalry Top 3
          </h3>
          <span className="text-[10px] text-neutral-400">
            {votesCastCount} live votes this session
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {rivalryStandings.map((c, i) => (
            <div
              key={c.college}
              className="flex items-center justify-between rounded-lg bg-neutral-50 px-2.5 py-1.5 text-xs dark:bg-neutral-800/50"
            >
              <span className="font-semibold">
                #{i + 1} {c.college}
              </span>
              <span className="font-bold text-neutral-600 dark:text-neutral-300">
                {c.score} pts
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link
            href="/rank"
            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            View full Leaderboard & Rivalry Board →
          </Link>
        </div>
      </section>
    </main>
  );
}