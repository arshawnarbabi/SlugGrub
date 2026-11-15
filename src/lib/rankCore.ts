// Owner: Karen. Pure ranking logic shared by the browser, the server and both stores (Firestore and the local fallback).
// No I/O here: the stores hand in stored stats, these functions turn them into dishes, standings and insights.
import type { College, DayMenu, DishRank, HallId, HallStanding, MealName } from "./types";
import { DEFAULT_ELO } from "./elo";
import { HALLS } from "./halls";

/** A dish is ranked per hall (the same recipe at two halls is two dishes): this is its id everywhere. */
export type DishKey = string;
export const dishKey = (hallId: HallId, recipeId: string): DishKey => `${hallId}_${recipeId}`;

export const HALL_IDS: HallId[] = HALLS.map((h) => h.id);
export const COLLEGES: College[] = HALLS.flatMap((h) => h.colleges);
export const isHallId = (v: unknown): v is HallId => typeof v === "string" && (HALL_IDS as string[]).includes(v);
export const isCollege = (v: unknown): v is College => typeof v === "string" && (COLLEGES as string[]).includes(v);

/** What a vote names: enough to create the dish's record the first time anyone votes on it. */
export interface DishRef { recipeId: string; name: string; hallId: HallId }

/** Stored stats for one dish (Firestore `dishes/{key}`, or the fallback store). */
export interface DishStat extends DishRef { elo: number; votes: number; wins: number; skips: number; lastVoteId?: string; lastSkipId?: string }

/** A rankable dish on the menus (the base list; stored stats overlay it). */
export interface CatalogDish extends DishRef {
  key: DishKey;
  category: string;
  meals: MealName[];
  calories?: number;
  base?: { elo: number }; // seed-list fallback only: its starting rating
}

export interface LiveSide extends DishRef { key: DishKey }
export interface LiveRound { roundId: string; a: LiveSide; b: LiveSide; aVotes: number; bVotes: number; startedAt: string }

/** Everything the screens read, from either store. */
export interface RankState {
  week: string; // Monday of the campus week, YYYY-MM-DD
  dishes: Record<DishKey, DishStat>;
  colleges: Partial<Record<College, number>>; // votes cast this week by each college's students
  opening: Partial<Record<HallId, number>> | null; // hall ranks when this week opened (last week's closing standings)
  round: LiveRound | null;
  myBallot: "a" | "b" | null; // this device's vote in the current live round
}

export const emptyState = (week: string): RankState => ({ week, dishes: {}, colleges: {}, opening: null, round: null, myBallot: null });

// Menu categories that are dishes people choose between (not condiments, drinks, cereal, the salad or deli bar).
const RANKABLE = new Set(["entrees", "hot bars", "market table", "clean plate", "grill", "pizza", "soups", "breakfast", "sweets treats", "sweet treats", "desserts"]);
export const isRankable = (category: string) => RANKABLE.has(category.trim().toLowerCase());

/** The rankable dishes on a day's menus, one per hall and recipe, with the meals it is served at. */
export function catalogFromMenus(menus: DayMenu[]): CatalogDish[] {
  const out = new Map<DishKey, CatalogDish>();
  for (const m of menus) {
    for (const [meal, dishes] of Object.entries(m.meals) as [MealName, DayMenu["meals"][MealName]][]) {
      for (const d of dishes ?? []) {
        if (!d?.recipeId || !d.name || !isRankable(d.category ?? "")) continue;
        const key = dishKey(m.hallId, d.recipeId);
        const have = out.get(key);
        if (have) { if (!have.meals.includes(meal)) have.meals.push(meal); continue; }
        out.set(key, { key, recipeId: d.recipeId, name: d.name, hallId: m.hallId, category: d.category, meals: [meal], calories: d.nutrition?.calories });
      }
    }
  }
  return [...out.values()];
}

// Fallback when no real menu is saved for the day: the original seed list (its ratings only; the made-up vote counts are dropped).
const SEED: [string, string, HallId, number][] = [
  ["mock-104", "Chicken Tikka Masala", "40", 1264], ["mock-101", "Pad Thai", "40", 1228], ["mock-103", "Cheese Pizza", "40", 1210],
  ["mock-102", "Bean & Cheese Burrito", "40", 1192], ["mock-105", "Steamed Jasmine Rice", "40", 1145],
  ["mock-201", "Pesto Pasta", "05", 1255], ["mock-203", "Garlic Herb Roasted Chicken", "05", 1242], ["mock-204", "Margherita Flatbread", "05", 1215],
  ["mock-202", "Roasted Vegetables", "05", 1160],
  ["mock-301", "Banana Slug Mac & Cheese", "20", 1270], ["mock-302", "BBQ Pulled Pork Sliders", "20", 1235], ["mock-303", "Crispy Sesame Tofu Stir-Fry", "20", 1180],
  ["mock-401", "Vegan Red Lentil Dahl", "25", 1248], ["mock-402", "Fresh Soba Noodle Bowl", "25", 1220], ["mock-403", "Seasoned Sweet Potato Fries", "25", 1205],
  ["mock-501", "Baja Crispy Fish Tacos", "30", 1260], ["mock-502", "Carne Asada Plate", "30", 1238], ["mock-503", "Black Bean & Corn Enchiladas", "30", 1175],
];
export const SEED_CATALOG: CatalogDish[] = SEED.map(([recipeId, name, hallId, elo]) => ({
  key: dishKey(hallId, recipeId), recipeId, name, hallId, category: "Entrees", meals: ["Lunch", "Dinner"], base: { elo },
}));

/** A dish's stats before anyone voted on it. */
export function baseStat(ref: DishRef, catalog?: CatalogDish): DishStat {
  return { recipeId: ref.recipeId, name: ref.name, hallId: ref.hallId, elo: catalog?.base?.elo ?? DEFAULT_ELO, votes: 0, wins: 0, skips: 0 };
}

/** Catalog plus stored stats (stored dishes from earlier days stay in). Sorted best first. */
export function mergeDishes(catalog: CatalogDish[], stats: Record<DishKey, DishStat>): DishRank[] {
  const out = new Map<DishKey, DishRank>();
  for (const c of catalog) {
    const s = stats[c.key] ?? baseStat(c, c);
    out.set(c.key, { recipeId: c.recipeId, name: c.name, hallId: c.hallId, elo: s.elo, votes: s.votes, wins: s.wins, skips: s.skips, calories: c.calories });
  }
  for (const [k, s] of Object.entries(stats)) {
    if (!out.has(k) && isHallId(s.hallId)) out.set(k, { recipeId: s.recipeId, name: s.name, hallId: s.hallId, elo: s.elo, votes: s.votes, wins: s.wins, skips: s.skips });
  }
  return sortDishes([...out.values()]);
}

export const sortDishes = (list: DishRank[]) => [...list].sort((a, b) => b.elo - a.elo || b.votes - a.votes || a.name.localeCompare(b.name));
/** A dish counts toward standings once it has a rating of its own (a vote, or a seed rating). */
const rated = (d: DishRank) => d.votes > 0 || d.elo !== DEFAULT_ELO;

/** Hall leaderboard: 65% the average of the hall's top half of rated dishes, 35% all its rated dishes (rewards standout dishes
 *  while counting consistency). A hall with no rated dish scores the default rating. `opening` gives last week's ranks. */
export function hallStandings(dishes: DishRank[], opening: Partial<Record<HallId, number>> | null): HallStanding[] {
  const scores = HALL_IDS.map((hallId) => {
    const list = dishes.filter((d) => d.hallId === hallId && rated(d)).sort((a, b) => b.elo - a.elo);
    if (list.length === 0) return { hallId, score: DEFAULT_ELO, n: 0 };
    const avg = list.reduce((s, d) => s + d.elo, 0) / list.length;
    const half = Math.max(1, Math.ceil(list.length / 2));
    const top = list.slice(0, half).reduce((s, d) => s + d.elo, 0) / half;
    return { hallId, score: Math.round(0.65 * top + 0.35 * avg), n: list.length };
  });
  scores.sort((a, b) => b.score - a.score || b.n - a.n || HALL_IDS.indexOf(a.hallId) - HALL_IDS.indexOf(b.hallId));
  return scores.map((s, i) => {
    const openingRank = opening?.[s.hallId];
    return { hallId: s.hallId, rank: i + 1, score: s.score, change: openingRank ? openingRank - (i + 1) : 0, ...(openingRank ? { openingRank } : {}) };
  });
}

/** The ranks to keep as a week's opening board: only halls with a rated dish (a tie at the default rating is not a standing). */
export const ranksOf = (standings: HallStanding[], dishes: DishRank[]): Partial<Record<HallId, number>> =>
  Object.fromEntries(standings.filter((s) => dishes.some((d) => d.hallId === s.hallId && rated(d))).map((s) => [s.hallId, s.rank]));

export interface CollegeStanding {
  college: College;
  hallId: HallId;
  rank: number;
  score: number; // this week's votes by the college's students
  votesCast: number;
  topDish: string; // best rated dish at the college's dining hall
}

/** Weekly college rivalry: colleges ranked by how many votes their students cast this week (stored counters, never hardcoded). */
export function collegeStandings(colleges: Partial<Record<College, number>>, dishes: DishRank[]): CollegeStanding[] {
  const rows = HALLS.flatMap((h) => {
    const top = dishes.filter((d) => d.hallId === h.id && rated(d)).sort((a, b) => b.elo - a.elo)[0];
    return h.colleges.map((college) => ({ college, hallId: h.id, votes: colleges[college] ?? 0, topDish: top?.name ?? "" }));
  });
  rows.sort((a, b) => b.votes - a.votes || COLLEGES.indexOf(a.college) - COLLEGES.indexOf(b.college));
  return rows.map((r, i) => ({ college: r.college, hallId: r.hallId, rank: i + 1, score: r.votes, votesCast: r.votes, topDish: r.topDish }));
}

export interface DishInsight extends DishRank {
  winRate: number; // % of its matchups won
  losses: number;
  skips: number;
  status: "loved" | "solid" | "skipped";
}

export interface DiningServicesReport {
  hallId?: HallId;
  averageElo: number;
  totalVotes: number; // matchups decided (each vote touches two dishes)
  totalSkips: number;
  lovedDishes: DishInsight[];
  skippedDishes: DishInsight[];
  recommendations: string[];
}

/** Loved and skipped dishes for dining services, from stored votes and skips only (dishes nobody voted on or skipped are left out). */
export function diningInsights(dishes: DishRank[], hallId?: HallId): DiningServicesReport {
  const pool = dishes.filter((d) => (!hallId || d.hallId === hallId) && (d.votes > 0 || (d.skips ?? 0) > 0));
  const insights: DishInsight[] = pool.map((d) => {
    const wins = d.wins ?? 0;
    const skips = d.skips ?? 0;
    const losses = Math.max(0, d.votes - wins);
    const winRate = d.votes > 0 ? Math.round((wins / d.votes) * 100) : 0;
    const status: DishInsight["status"] = d.votes > 0 && winRate >= 60 && d.elo > DEFAULT_ELO ? "loved"
      : skips > 0 || (d.votes > 0 && winRate <= 40) ? "skipped" : "solid";
    return { ...d, wins, winRate, losses, skips, status };
  });
  const lovedDishes = insights.filter((i) => i.status === "loved").sort((a, b) => b.elo - a.elo || b.votes - a.votes);
  const skippedDishes = insights.filter((i) => i.status === "skipped").sort((a, b) => b.skips + b.losses - (a.skips + a.losses) || a.elo - b.elo);
  const voted = pool.filter((d) => d.votes > 0);
  const averageElo = voted.length ? Math.round(voted.reduce((s, d) => s + d.elo, 0) / voted.length) : DEFAULT_ELO;
  const recommendations: string[] = [];
  if (lovedDishes[0]) recommendations.push(`Keep ${lovedDishes[0].name} on rotation: it won ${lovedDishes[0].winRate}% of its matchups.`);
  const s = skippedDishes[0];
  if (s) {
    const why = [s.skips > 0 && `skipped ${s.skips === 1 ? "once" : `${s.skips} times`}`, s.losses > 0 && `lost ${s.losses} ${s.losses === 1 ? "matchup" : "matchups"}`].filter(Boolean).join(", ");
    recommendations.push(`Look at ${s.name}: ${why}.`);
  }
  return {
    hallId,
    averageElo,
    totalVotes: Math.round(pool.reduce((s, d) => s + d.votes, 0) / 2),
    totalSkips: pool.reduce((s, d) => s + (d.skips ?? 0), 0),
    lovedDishes,
    skippedDishes,
    recommendations,
  };
}

/** Monday of the week that holds `date` (YYYY-MM-DD, campus date). Weeks run Monday to Sunday. */
export function weekOf(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  const back = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
}

/** One vote per user per matchup per day: the same pair can be ranked again another day. */
export const matchIdFor = (date: string, a: DishKey, b: DishKey) => `${date}_${[a, b].sort().join("_")}`.replace(/[^A-Za-z0-9_-]/g, "-");
export const liveMatchId = (roundId: string) => `live-${roundId}`;
export const voteDocId = (voter: string, matchId: string) => `${voter}_${matchId}`;

export const refOf = (d: DishRef): DishRef => ({ recipeId: d.recipeId, name: d.name, hallId: d.hallId });
export const isDishRef = (v: unknown): v is DishRef => {
  const r = v as DishRef;
  return !!r && typeof r.recipeId === "string" && r.recipeId.length > 0 && r.recipeId.length <= 40 && /^[A-Za-z0-9_-]+$/.test(r.recipeId)
    && typeof r.name === "string" && r.name.length > 0 && r.name.length <= 120 && isHallId(r.hallId);
};
