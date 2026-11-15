// Owner: Karen. Server only. The local fallback store, used when Firebase is not configured: an in-memory copy of the same
// collections (dishes, votes, skips, weekly college counters, week-opening boards, the live round) behind src/app/api/vote.
// It lives on globalThis so route handlers and server components share one copy inside a server process. It is NOT shared
// across Vercel instances and is wiped on restart: production needs Firebase. JavaScript runs each call to completion, so every
// function below is atomic, the same guarantee Firestore's runTransaction gives the configured path.
import type { College } from "./types";
import { calculateElo } from "./elo";
import {
  baseStat, emptyState, hallStandings, liveMatchId, mergeDishes, ranksOf, voteDocId,
  type CatalogDish, type DishKey, type DishRef, type DishStat, type LiveRound, type LiveSide, type RankState, dishKey,
} from "./rankCore";

interface VoteDoc { winner: DishKey; loser: DishKey; college?: College; delta: number; at: string }
interface Mem {
  dishes: Map<DishKey, DishStat>;
  votes: Map<string, VoteDoc>;
  skips: Set<string>;
  colleges: Map<string, Partial<Record<College, number>>>;
  boards: Map<string, Partial<Record<string, number>>>;
  round: LiveRound | null;
}

const g = globalThis as typeof globalThis & { __sluggrubRankStore?: Mem };
function mem(): Mem {
  if (!g.__sluggrubRankStore) {
    g.__sluggrubRankStore = { dishes: new Map(), votes: new Map(), skips: new Set(), colleges: new Map(), boards: new Map(), round: null };
  }
  return g.__sluggrubRankStore;
}

export type StoreResult = { ok: true; delta?: number } | { ok: false; error: "already" | "invalid" | "round-over" | "not-found" };

const statOf = (m: Mem, ref: DishRef, catalog: CatalogDish[]) => {
  const key = dishKey(ref.hallId, ref.recipeId);
  return m.dishes.get(key) ?? baseStat(ref, catalog.find((c) => c.key === key));
};

/** Snapshot for one reader. Opens this week's board (the standings as the week's first reader found them) if nobody has yet. */
export function memState(catalog: CatalogDish[], week: string, voter?: string): RankState {
  const m = mem();
  const dishes = Object.fromEntries(m.dishes);
  if (!m.boards.has(week)) { const all = mergeDishes(catalog, dishes); m.boards.set(week, ranksOf(hallStandings(all, null), all)); }
  const round = m.round;
  const mine = round && voter ? m.votes.get(voteDocId(voter, liveMatchId(round.roundId))) : undefined;
  return {
    ...emptyState(week),
    dishes,
    colleges: { ...(m.colleges.get(week) ?? {}) },
    opening: { ...m.boards.get(week) },
    round,
    myBallot: mine && round ? (mine.winner === round.a.key ? "a" : "b") : null,
  };
}

function applyVote(m: Mem, catalog: CatalogDish[], id: string, winner: DishRef, loser: DishRef, week: string, college?: College): number {
  const w = statOf(m, winner, catalog);
  const l = statOf(m, loser, catalog);
  const r = calculateElo(w.elo, l.elo, undefined, w.votes, l.votes);
  m.dishes.set(dishKey(w.hallId, w.recipeId), { ...w, elo: r.newWinnerElo, votes: w.votes + 1, wins: w.wins + 1, lastVoteId: id });
  m.dishes.set(dishKey(l.hallId, l.recipeId), { ...l, elo: r.newLoserElo, votes: l.votes + 1, lastVoteId: id });
  m.votes.set(id, { winner: dishKey(w.hallId, w.recipeId), loser: dishKey(l.hallId, l.recipeId), college, delta: r.winnerDelta, at: new Date().toISOString() });
  if (college) {
    const c = m.colleges.get(week) ?? {};
    c[college] = (c[college] ?? 0) + 1;
    m.colleges.set(week, c);
  }
  return r.winnerDelta;
}

/** This-or-that vote: one per voter per matchup per day. */
export function memVote(catalog: CatalogDish[], a: { voter: string; matchId: string; winner: DishRef; loser: DishRef; week: string; college?: College }): StoreResult {
  const m = mem();
  const id = voteDocId(a.voter, a.matchId);
  if (m.votes.has(id)) return { ok: false, error: "already" };
  return { ok: true, delta: applyVote(m, catalog, id, a.winner, a.loser, a.week, a.college) };
}

/** Undo a this-or-that vote: reverses its Elo change, counts and college point. Live-round ballots cannot be undone. */
export function memUndo(a: { voter: string; matchId: string; week: string }): StoreResult {
  const m = mem();
  const id = voteDocId(a.voter, a.matchId);
  const v = m.votes.get(id);
  if (!v || a.matchId.startsWith("live-")) return { ok: false, error: "not-found" };
  const w = m.dishes.get(v.winner);
  const l = m.dishes.get(v.loser);
  if (w) m.dishes.set(v.winner, { ...w, elo: w.elo - v.delta, votes: Math.max(0, w.votes - 1), wins: Math.max(0, w.wins - 1), lastVoteId: id });
  if (l) m.dishes.set(v.loser, { ...l, elo: l.elo + v.delta, votes: Math.max(0, l.votes - 1), lastVoteId: id });
  if (v.college) {
    const c = m.colleges.get(a.week);
    if (c?.[v.college]) c[v.college] = Math.max(0, (c[v.college] ?? 0) - 1);
  }
  m.votes.delete(id);
  return { ok: true, delta: v.delta };
}

/** "Haven't tried these": counts a skip on both dishes, once per voter per matchup per day. */
export function memSkip(catalog: CatalogDish[], a: { voter: string; matchId: string; a: DishRef; b: DishRef }): StoreResult {
  const m = mem();
  const id = voteDocId(a.voter, a.matchId);
  if (m.skips.has(id)) return { ok: false, error: "already" };
  m.skips.add(id);
  for (const ref of [a.a, a.b]) {
    const s = statOf(m, ref, catalog);
    m.dishes.set(dishKey(s.hallId, s.recipeId), { ...s, skips: s.skips + 1, lastSkipId: id });
  }
  return { ok: true };
}

/** Start a new live round (the projector's Next round). */
export function memStartRound(a: LiveSide, b: LiveSide, roundId: string): StoreResult {
  mem().round = { roundId, a, b, aVotes: 0, bVotes: 0, startedAt: new Date().toISOString() };
  return { ok: true };
}

/** One ballot per device per live round; it also counts as a this-or-that vote (Elo and the college counter). */
export function memBallot(catalog: CatalogDish[], a: { voter: string; roundId: string; side: "a" | "b"; week: string; college?: College }): StoreResult {
  const m = mem();
  const round = m.round;
  if (!round || round.roundId !== a.roundId) return { ok: false, error: "round-over" };
  const id = voteDocId(a.voter, liveMatchId(round.roundId));
  if (m.votes.has(id)) return { ok: false, error: "already" };
  const [winner, loser] = a.side === "a" ? [round.a, round.b] : [round.b, round.a];
  const delta = applyVote(m, catalog, id, winner, loser, a.week, a.college);
  m.round = { ...round, aVotes: round.aVotes + (a.side === "a" ? 1 : 0), bVotes: round.bVotes + (a.side === "b" ? 1 : 0) };
  return { ok: true, delta };
}
