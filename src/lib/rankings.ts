// Owner: Karen. Rankings, matchups, and leaderboards for everyone else.
// Keep exported function names and return types stable.

import type { DishRank, HallId, HallStanding } from "./types";
import { calculateElo, DEFAULT_ELO, type EloResult } from "./elo";
import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

// Seed dishes from mock menus with baseline Elo ratings
const SEED_DISHES: DishRank[] = [
  { recipeId: "mock-104", name: "Chicken Tikka Masala", hallId: "40", elo: 1264, votes: 42 },
  { recipeId: "mock-201", name: "Pesto Pasta", hallId: "05", elo: 1255, votes: 38 },
  { recipeId: "mock-101", name: "Pad Thai", hallId: "40", elo: 1228, votes: 29 },
  { recipeId: "mock-103", name: "Cheese Pizza", hallId: "40", elo: 1210, votes: 55 },
  { recipeId: "mock-102", name: "Bean & Cheese Burrito", hallId: "40", elo: 1192, votes: 24 },
  { recipeId: "mock-202", name: "Roasted Vegetables", hallId: "05", elo: 1160, votes: 19 },
  { recipeId: "mock-105", name: "Steamed Jasmine Rice", hallId: "40", elo: 1145, votes: 15 },
];

// In-memory cache for fast UI updates & offline fallback
let localDishes: DishRank[] = [...SEED_DISHES];

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

export async function getLeaderboard(): Promise<HallStanding[]> {
  // Aggregate average Elo by dining hall
  const all = await getAllDishes();
  const halls: HallId[] = ["20", "05", "25", "40", "30"];

  const scores = halls.map((hallId) => {
    const hallDishes = all.filter((d) => d.hallId === hallId);
    const avgScore =
      hallDishes.length > 0
        ? Math.round(hallDishes.reduce((sum, d) => sum + d.elo, 0) / hallDishes.length)
        : DEFAULT_ELO;
    return { hallId, score: avgScore };
  });

  scores.sort((a, b) => b.score - a.score);

  return scores.map((s, index) => ({
    hallId: s.hallId,
    rank: index + 1,
    score: s.score,
    change: index === 0 ? 0 : 1,
  }));
}

export async function submitDishVote(
  winnerId: string,
  loserId: string
): Promise<EloResult> {
  const winner = localDishes.find((d) => d.recipeId === winnerId);
  const loser = localDishes.find((d) => d.recipeId === loserId);

  const winnerElo = winner ? winner.elo : DEFAULT_ELO;
  const loserElo = loser ? loser.elo : DEFAULT_ELO;

  const result = calculateElo(winnerElo, loserElo);

  // Update in-memory cache
  if (winner) {
    winner.elo = result.newWinnerElo;
    winner.votes += 1;
  }
  if (loser) {
    loser.elo = result.newLoserElo;
    loser.votes += 1;
  }

  // Persist to Firestore in the background
  try {
    if (db && winner && loser) {
      await setDoc(doc(db, "dishes", winner.recipeId), winner, { merge: true });
      await setDoc(doc(db, "dishes", loser.recipeId), loser, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore sync deferred:", err);
  }

  return result;
}
