// Owner: Karen. Rankings and leaderboards for everyone else.
// Returns fake data until Firebase is wired. Keep names and return types stable.

import type { DishRank, HallId, HallStanding } from "./types";

export async function getTopDishNow(hallId: HallId): Promise<DishRank | null> {
  // TODO (Karen): highest-Elo dish being served right now at this hall
  return { recipeId: "mock-104", name: "Chicken Tikka Masala", hallId, elo: 1240, votes: 37 };
}

export async function getTopDishOnCampus(): Promise<DishRank | null> {
  // TODO (Karen): highest-Elo dish being served right now at any hall
  return { recipeId: "mock-201", name: "Pesto Pasta", hallId: "05", elo: 1275, votes: 52 };
}

export async function getLeaderboard(): Promise<HallStanding[]> {
  // TODO (Karen): this week's hall standings from votes
  return [
    { hallId: "20", rank: 1, score: 1251, change: 0 },
    { hallId: "05", rank: 2, score: 1238, change: 1 },
    { hallId: "25", rank: 3, score: 1210, change: 1 },
    { hallId: "40", rank: 4, score: 1195, change: -2 },
    { hallId: "30", rank: 5, score: 1170, change: 0 },
  ];
}
