// Owner: Karen. Rankings, matchups, and leaderboards for everyone else (server side: Today and any server component).
// Keep exported function names and return types stable.
//
// Where the numbers come from: the rankable dishes on today's real menus (rankCatalog.ts), overlaid with stored votes. Stored votes
// live in Firestore when NEXT_PUBLIC_FIREBASE_* is set (read here over REST), else in the local fallback store (rankMemory.ts).
// Browser screens read and vote through src/lib/rankClient.ts (onSnapshot or polling), not through this file.
import type { College, DishRank, HallId, HallStanding } from "./types";
import type { EloResult } from "./elo";
import { firebaseConfigured } from "./firebase";
import { restState } from "./firestoreRest";
import { getCatalog, campusDate } from "./rankCatalog";
import { memSkip, memState, memVote } from "./rankMemory";
import {
  collegeStandings, diningInsights, emptyState, hallStandings, matchIdFor, mergeDishes, weekOf, dishKey,
  type CollegeStanding, type DiningServicesReport, type DishInsight, type RankState,
} from "./rankCore";
import { campusNow, hoursFor, mealToLog } from "@/components/screens/now";
import { dishPhoto } from "@/components/screens/dishPhoto";

export type { CollegeStanding, DiningServicesReport, DishInsight };

async function load() {
  const date = campusDate();
  const week = weekOf(date);
  const catalog = await getCatalog(date);
  const state: RankState = firebaseConfigured ? ((await restState(week)) ?? emptyState(week)) : memState(catalog.dishes, week);
  return { date, catalog, state, dishes: mergeDishes(catalog.dishes, state.dishes) };
}

export async function getAllDishes(): Promise<DishRank[]> {
  return (await load()).dishes;
}

/** Best dish at a hall right now: from the meal being served (or the last one that opened), else today's menu, else anything
 *  ranked there. Equal ratings prefer a dish with a photo, then more votes. */
export async function getTopDishNow(hallId: HallId): Promise<DishRank | null> {
  const { catalog, dishes } = await load();
  const meal = mealToLog(hoursFor(hallId), campusNow(new Date()).minutes);
  const today = catalog.dishes.filter((c) => c.hallId === hallId);
  const inMeal = new Set(today.filter((c) => c.meals.includes(meal)).map((c) => c.key));
  const onToday = new Set(today.map((c) => c.key));
  const atHall = dishes.filter((d) => d.hallId === hallId);
  const key = (d: DishRank) => dishKey(d.hallId, d.recipeId);
  const pool = [atHall.filter((d) => inMeal.has(key(d))), atHall.filter((d) => onToday.has(key(d))), atHall].find((p) => p.length > 0) ?? [];
  const best = [...pool].sort((a, b) => b.elo - a.elo || Number(!!dishPhoto(b.name)) - Number(!!dishPhoto(a.name)) || b.votes - a.votes);
  return best[0] ?? null;
}

export async function getTopDishOnCampus(): Promise<DishRank | null> {
  const all = await getAllDishes();
  return all.find((d) => d.votes > 0) ?? all[0] ?? null;
}

/** Hall leaderboard from stored votes; `change` compares with last week's closing ranks (0, and no openingRank, until one exists). */
export async function getLeaderboard(): Promise<HallStanding[]> {
  const { dishes, state } = await load();
  return hallStandings(dishes, state.opening);
}

/** Weekly college rivalry: votes cast this week by each college's students (atomic counters). */
export async function getCollegeRivalry(): Promise<CollegeStanding[]> {
  const { dishes, state } = await load();
  return collegeStandings(state.colleges, dishes);
}

/** Loved and skipped dishes for UCSC Dining Services staff, from stored votes and skips. */
export async function getDiningServicesInsights(hallId?: HallId): Promise<DiningServicesReport> {
  return diningInsights(await getAllDishes(), hallId);
}

const SERVER_VOTER = "server-local";
const refFor = (dishes: DishRank[], recipeId: string) => dishes.find((d) => d.recipeId === recipeId);
const noServerWrites = () => new Error("With Firebase configured, votes are written from the browser (src/lib/rankClient.ts).");

/** Records a skip ("Haven't tried these") server side, in the local fallback store. Screens use rankClient instead. */
export async function recordDishSkip(dishAId: string, dishBId: string): Promise<void> {
  if (firebaseConfigured) throw noServerWrites();
  const { date, catalog, dishes } = await load();
  const a = refFor(dishes, dishAId), b = refFor(dishes, dishBId);
  if (!a || !b) return;
  memSkip(catalog.dishes, { voter: SERVER_VOTER, matchId: matchIdFor(date, dishKey(a.hallId, a.recipeId), dishKey(b.hallId, b.recipeId)), a, b });
}

/** Submits a vote server side, in the local fallback store (one K per match, symmetric). Screens use rankClient instead. */
export async function submitDishVote(winnerId: string, loserId: string, college?: College): Promise<EloResult> {
  if (firebaseConfigured) throw noServerWrites();
  const { date, catalog, dishes } = await load();
  const w = refFor(dishes, winnerId), l = refFor(dishes, loserId);
  if (!w || !l) throw new Error("Unknown dish");
  const r = memVote(catalog.dishes, { voter: SERVER_VOTER, matchId: matchIdFor(date, dishKey(w.hallId, w.recipeId), dishKey(l.hallId, l.recipeId)), winner: w, loser: l, week: weekOf(date), college });
  const delta = r.ok ? r.delta ?? 0 : 0;
  return { newWinnerElo: w.elo + delta, newLoserElo: l.elo - delta, winnerDelta: delta, loserDelta: -delta };
}
