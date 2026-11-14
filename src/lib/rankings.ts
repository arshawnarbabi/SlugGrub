// Owner: Karen. Rankings, matchups, and leaderboards for everyone else.
// Keep exported function names and return types stable.

import type { DishRank, HallId, HallStanding, College, Vote } from "./types";
import { calculateElo, DEFAULT_ELO, type EloResult } from "./elo";
import { db } from "./firebase";
import { doc, setDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { HALLS } from "./halls";

// Seed dishes covering all 5 UCSC dining halls with baseline Elo ratings
const SEED_DISHES: (DishRank & { wins?: number; skips?: number })[] = [
  // John R. Lewis & College Nine (40)
  { recipeId: "mock-104", name: "Chicken Tikka Masala", hallId: "40", elo: 1264, votes: 42, wins: 28, skips: 2 },
  { recipeId: "mock-101", name: "Pad Thai", hallId: "40", elo: 1228, votes: 29, wins: 18, skips: 4 },
  { recipeId: "mock-103", name: "Cheese Pizza", hallId: "40", elo: 1210, votes: 55, wins: 29, skips: 1 },
  { recipeId: "mock-102", name: "Bean & Cheese Burrito", hallId: "40", elo: 1192, votes: 24, wins: 12, skips: 5 },
  { recipeId: "mock-105", name: "Steamed Jasmine Rice", hallId: "40", elo: 1145, votes: 15, wins: 5, skips: 8 },

  // Cowell & Stevenson (05)
  { recipeId: "mock-201", name: "Pesto Pasta", hallId: "05", elo: 1255, votes: 38, wins: 24, skips: 3 },
  { recipeId: "mock-203", name: "Garlic Herb Roasted Chicken", hallId: "05", elo: 1242, votes: 31, wins: 20, skips: 2 },
  { recipeId: "mock-204", name: "Margherita Flatbread", hallId: "05", elo: 1215, votes: 22, wins: 13, skips: 3 },
  { recipeId: "mock-202", name: "Roasted Vegetables", hallId: "05", elo: 1160, votes: 19, wins: 8, skips: 6 },

  // Crown & Merrill (20)
  { recipeId: "mock-301", name: "Banana Slug Mac & Cheese", hallId: "20", elo: 1270, votes: 45, wins: 31, skips: 1 },
  { recipeId: "mock-302", name: "BBQ Pulled Pork Sliders", hallId: "20", elo: 1235, votes: 27, wins: 17, skips: 3 },
  { recipeId: "mock-303", name: "Crispy Sesame Tofu Stir-Fry", hallId: "20", elo: 1180, votes: 18, wins: 8, skips: 5 },

  // Porter & Kresge (25)
  { recipeId: "mock-401", name: "Vegan Red Lentil Dahl", hallId: "25", elo: 1248, votes: 33, wins: 21, skips: 2 },
  { recipeId: "mock-402", name: "Fresh Soba Noodle Bowl", hallId: "25", elo: 1220, votes: 26, wins: 15, skips: 3 },
  { recipeId: "mock-403", name: "Seasoned Sweet Potato Fries", hallId: "25", elo: 1205, votes: 30, wins: 16, skips: 2 },

  // Rachel Carson & Oakes (30)
  { recipeId: "mock-501", name: "Baja Crispy Fish Tacos", hallId: "30", elo: 1260, votes: 36, wins: 23, skips: 2 },
  { recipeId: "mock-502", name: "Carne Asada Plate", hallId: "30", elo: 1238, votes: 28, wins: 17, skips: 4 },
  { recipeId: "mock-503", name: "Black Bean & Corn Enchiladas", hallId: "30", elo: 1175, votes: 17, wins: 7, skips: 6 },
];

// In-memory cache for fast UI updates & offline fallback
let localDishes = [...SEED_DISHES];

// In-memory votes by college for rivalry calculation
const localCollegeVotes: Record<College, number> = {
  Cowell: 28,
  Stevenson: 24,
  Crown: 34,
  Merrill: 20,
  Porter: 29,
  Kresge: 18,
  Oakes: 19,
  "Rachel Carson": 26,
  "College Nine": 32,
  "John R. Lewis": 27,
};

export async function getAllDishes(): Promise<DishRank[]> {
  try {
    if (db) {
      const snap = await getDocs(collection(db, "dishes"));
      if (!snap.empty) {
        const remoteDishes = snap.docs.map((d) => d.data() as DishRank);
        if (remoteDishes.length > 0) {
          localDishes = remoteDishes;
        }
      }
    }
  } catch (err) {
    console.warn("Using local dishes cache:", err);
  }
  return [...localDishes].sort((a, b) => b.elo - a.elo);
}

export async function getTopDishNow(hallId: HallId): Promise<DishRank | null> {
  const all = await getAllDishes();
  const atHall = all.filter((d) => d.hallId === hallId);
  return atHall.length > 0 ? atHall[0] : null;
}

export async function getTopDishOnCampus(): Promise<DishRank | null> {
  const all = await getAllDishes();
  return all.length > 0 ? all[0] : null;
}

/**
 * Calculates Hall Leaderboard rankings.
 * Uses a weighted quality metric: 65% weight on top-half dishes + 35% overall average
 * to reward standout specialty dishes while factoring in overall consistency.
 */
export async function getLeaderboard(): Promise<HallStanding[]> {
  const all = await getAllDishes();
  const halls: HallId[] = ["20", "05", "25", "40", "30"];

  const scores = halls.map((hallId) => {
    const hallDishes = all.filter((d) => d.hallId === hallId).sort((a, b) => b.elo - a.elo);
    if (hallDishes.length === 0) {
      return { hallId, score: DEFAULT_ELO };
    }

    const overallAvg = hallDishes.reduce((sum, d) => sum + d.elo, 0) / hallDishes.length;
    const topHalfCount = Math.max(1, Math.ceil(hallDishes.length / 2));
    const topHalfAvg =
      hallDishes.slice(0, topHalfCount).reduce((sum, d) => sum + d.elo, 0) / topHalfCount;

    // Weighted composite score
    const compositeScore = Math.round(0.65 * topHalfAvg + 0.35 * overallAvg);
    return { hallId, score: compositeScore };
  });

  scores.sort((a, b) => b.score - a.score);

  return scores.map((s, index) => ({
    hallId: s.hallId,
    rank: index + 1,
    score: s.score,
    change: index === 0 ? 0 : index % 2 === 1 ? 1 : -1,
  }));
}

export interface CollegeStanding {
  college: College;
  hallId: HallId;
  rank: number;
  score: number;
  votesCast: number;
  topDish: string;
}

/**
 * Calculates Weekly College Rivalry standings across all 10 UCSC colleges.
 * Combines:
 * - Base score from the college's paired dining hall dishes
 * - Student participation score (+2 points per vote cast by that college)
 */
export async function getCollegeRivalry(): Promise<CollegeStanding[]> {
  const all = await getAllDishes();
  const standings: CollegeStanding[] = [];

  for (const hall of HALLS) {
    const hallDishes = all.filter((d) => d.hallId === hall.id).sort((a, b) => b.elo - a.elo);
    const baseHallScore =
      hallDishes.length > 0
        ? Math.round(hallDishes.reduce((sum, d) => sum + d.elo, 0) / hallDishes.length)
        : DEFAULT_ELO;
    const topDishName = hallDishes.length > 0 ? hallDishes[0].name : "Daily Special";

    for (const college of hall.colleges) {
      const votes = localCollegeVotes[college] ?? 10;
      // College score = Hall dish quality + student voter turnout bonus
      const totalScore = baseHallScore + Math.min(100, votes * 2);
      standings.push({
        college,
        hallId: hall.id,
        rank: 0,
        score: totalScore,
        votesCast: votes,
        topDish: topDishName,
      });
    }
  }

  standings.sort((a, b) => b.score - a.score);
  return standings.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

export interface DishInsight extends DishRank {
  winRate: number;
  skips: number;
  status: "loved" | "solid" | "skipped";
}

export interface DiningServicesReport {
  hallId?: HallId;
  averageElo: number;
  totalVotes: number;
  lovedDishes: DishInsight[];
  skippedDishes: DishInsight[];
  recommendations: string[];
}

/**
 * Generates loved and skipped dish insights for UCSC Dining Services staff.
 */
export async function getDiningServicesInsights(hallId?: HallId): Promise<DiningServicesReport> {
  const all = await getAllDishes();
  const pool = hallId ? all.filter((d) => d.hallId === hallId) : all;

  const insights: DishInsight[] = pool.map((d) => {
    const raw = d as DishRank & { wins?: number; skips?: number };
    const wins = raw.wins ?? Math.round(d.votes * (d.elo >= DEFAULT_ELO ? 0.6 : 0.4));
    const skips = raw.skips ?? Math.max(1, Math.round(d.votes * 0.1));
    const winRate = d.votes > 0 ? Math.round((wins / d.votes) * 100) : 50;

    let status: "loved" | "solid" | "skipped" = "solid";
    if (d.elo >= 1240 && winRate >= 55) {
      status = "loved";
    } else if (d.elo < 1170 || winRate < 42 || skips >= 6) {
      status = "skipped";
    }

    return {
      ...d,
      winRate,
      skips,
      status,
    };
  });

  const lovedDishes = insights.filter((i) => i.status === "loved").sort((a, b) => b.elo - a.elo);
  const skippedDishes = insights.filter((i) => i.status === "skipped").sort((a, b) => a.elo - b.elo);

  const averageElo =
    pool.length > 0
      ? Math.round(pool.reduce((sum, d) => sum + d.elo, 0) / pool.length)
      : DEFAULT_ELO;
  const totalVotes = pool.reduce((sum, d) => sum + d.votes, 0);

  const recommendations: string[] = [];
  if (lovedDishes.length > 0) {
    recommendations.push(
      `Keep '${lovedDishes[0].name}' on frequent rotation — student satisfaction index is exceptionally high.`
    );
  }
  if (skippedDishes.length > 0) {
    recommendations.push(
      `Review recipe or seasoning for '${skippedDishes[0].name}' due to high skip rate and lower head-to-head win rate.`
    );
  }
  recommendations.push("Pair high-performing entrees with popular vegetable sides to reduce food waste.");

  return {
    hallId,
    averageElo,
    totalVotes,
    lovedDishes,
    skippedDishes,
    recommendations,
  };
}

/**
 * Records a skip when a user clicks 'Haven't tried these / Skip'.
 */
export async function recordDishSkip(dishAId: string, dishBId: string): Promise<void> {
  const dishA = localDishes.find((d) => d.recipeId === dishAId) as (DishRank & { skips?: number }) | undefined;
  const dishB = localDishes.find((d) => d.recipeId === dishBId) as (DishRank & { skips?: number }) | undefined;
  if (dishA) dishA.skips = (dishA.skips ?? 0) + 1;
  if (dishB) dishB.skips = (dishB.skips ?? 0) + 1;
}

/**
 * Submits a vote between two dishes and updates Elo with adaptive K-factor.
 */
export async function submitDishVote(
  winnerId: string,
  loserId: string,
  college?: College
): Promise<EloResult> {
  const winner = localDishes.find((d) => d.recipeId === winnerId) as
    | (DishRank & { wins?: number })
    | undefined;
  const loser = localDishes.find((d) => d.recipeId === loserId) as
    | (DishRank & { wins?: number })
    | undefined;

  const winnerElo = winner ? winner.elo : DEFAULT_ELO;
  const loserElo = loser ? loser.elo : DEFAULT_ELO;
  const winnerVotes = winner ? winner.votes : 0;
  const loserVotes = loser ? loser.votes : 0;

  const result = calculateElo(winnerElo, loserElo, undefined, winnerVotes, loserVotes);

  // Update in-memory cache
  if (winner) {
    winner.elo = result.newWinnerElo;
    winner.votes += 1;
    winner.wins = (winner.wins ?? 0) + 1;
  }
  if (loser) {
    loser.elo = result.newLoserElo;
    loser.votes += 1;
  }

  // Update college rivalry points
  if (college && localCollegeVotes[college] !== undefined) {
    localCollegeVotes[college] += 1;
  }

  // Persist to Firestore in the background
  try {
    if (db && winner && loser) {
      await setDoc(doc(db, "dishes", winner.recipeId), winner, { merge: true });
      await setDoc(doc(db, "dishes", loser.recipeId), loser, { merge: true });

      const voteRecord: Vote = {
        winnerRecipeId: winnerId,
        loserRecipeId: loserId,
        userId: "anon-student",
        college,
        at: new Date().toISOString(),
      };
      await addDoc(collection(db, "votes"), voteRecord);
    }
  } catch (err) {
    console.warn("Firestore sync deferred:", err);
  }

  return result;
}
