// Owner: Arshawn. Demo mode's ranking store (switch: src/lib/demoMode.ts; docs/DECISIONS.md, "Demo mode"). Browser only, in memory,
// and never touches Firestore or /api/vote. It builds believable mock state over this week's REAL dish catalog (/api/demo: real
// hall ids, recipe ids, names, so real photos) with a fixed random seed, then plays the same Elo math as the real stores
// (calculateElo), so every dish's elo, votes and wins agree. Votes, undos, skips and live ballots cast in demo mode change this
// copy only, so the vote flow, the leaderboard and changing an answer all behave as they do with real votes. A reload starts over.
//
// What it makes: up to 28 dishes per hall (today's menus first, dishes with photos first; closed halls use the rest of the week),
// 1,000 simulated matchups (about 7% of them skips), a weekly count for every college, an opening board a little different from
// the current standings (so movement arrows show), and a live round of two real dishes with modest tallies.
import { useEffect, useState } from "react";
import type { College, HallId } from "./types";
import { calculateElo } from "./elo";
import { HALLS } from "./halls";
import {
  baseStat, dishKey, hallStandings, liveMatchId, mergeDishes, COLLEGES, HALL_IDS,
  type CatalogDish, type DishKey, type DishRef, type DishStat, type LiveRound, type LiveSide, type RankState,
} from "./rankCore";
import type { Outcome } from "./rankClient";
import { dishPhoto } from "@/components/screens/dishPhoto";

interface DemoCatalog { week: string; date: string; today: CatalogDish[]; others: CatalogDish[] }
interface VoteRec { winner: DishKey; loser: DishKey; delta: number; college?: College }
interface Store { state: RankState; today: CatalogDish[]; votes: Map<string, VoteRec>; skips: Set<string> }

/* ── Seeded randomness: the same catalog always gives the same mock week ── */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
function weighted<T>(items: T[], w: (t: T) => number, r: () => number): T {
  const ws = items.map(w);
  let x = r() * ws.reduce((s, v) => s + v, 0);
  for (let i = 0; i < items.length; i++) { x -= ws[i]; if (x <= 0) return items[i]; }
  return items[items.length - 1];
}

/* ── Hidden appeal: what students would tend to pick. Mains and desserts win; plain sides and condiments lose. ── */
const APPEAL: [RegExp, number][] = [
  [/condiment|sauce|salsa|sour cream|cilantro|jalape|pico de gallo|dressing|gravy|syrup|ketchup|available upon request|kosher salt|guacamole|shredded/i, -1.6],
  [/\bbar\b/i, -0.9], // station names ("Central Indian Bar")
  [/steamed|plain|oatmeal|hard boiled|tortilla|quinoa|slaw|bok choy|cauliflower|broccoli|carrots|kale|eggplant|white beans|charro beans|corn salad|cobbette|\brice\b|pullao/i, -0.8],
  [/chicken|wings|tenders/i, 1.0],
  [/pizza/i, 1.2],
  [/curry|tikka|masala|korma/i, 1.1],
  [/burrito|taco|quesadilla|enchilada|nacho|carne|asada|pastor|picada/i, 1.0],
  [/ribs|bbq|brisket|pulled pork|braised pork|carnitas|beef|steak/i, 0.9],
  [/mac & cheese|mac and cheese|waffle|french toast|pancake|corn dog|fries|fry\b|scampi|pasta|penne|alfredo|lasagna|naan|cornbread|focaccia/i, 0.7],
  [/cookie|donut|\bpie\b|cake|brownie|cobbler|churro|cheesecake|pudding|dessert|ice cream|cinnamon roll|snickerdoodle/i, 1.0],
  [/scrambled|sausage|bacon|ham steak/i, 0.3],
  [/gluten-free|gluten free|allergen free/i, -0.5], // the special-diet version rarely beats the regular one
];
function appealOf(name: string): number {
  const v = APPEAL.reduce((s, [re, w]) => (re.test(name) ? s + w : s), 0);
  return Math.max(-2.2, Math.min(1.6, v));
}

const PER_HALL = 28;
const MATCHUPS = 1000;

/** Up to PER_HALL dishes per hall: today's photo dishes first (they are what the screens show), then the rest of today's, then
 *  the rest of the week (a hall closed today still gets a full board). */
function pickDishes(cat: DemoCatalog): CatalogDish[] {
  const order = (list: CatalogDish[]) => [...list].sort((a, b) => Number(!!dishPhoto(b.name)) - Number(!!dishPhoto(a.name)) || hash(a.key) - hash(b.key));
  return HALL_IDS.flatMap((h) => {
    const today = order(cat.today.filter((c) => c.hallId === h));
    const rest = order(cat.others.filter((c) => c.hallId === h));
    const photo = today.filter((c) => dishPhoto(c.name)).slice(0, PER_HALL - 6);
    const fill = [...today, ...rest].filter((c) => !photo.includes(c));
    return [...photo, ...fill].slice(0, PER_HALL);
  });
}

function simulate(cat: DemoCatalog, seed: number) {
  const r = mulberry32(seed);
  const dishes = pickDishes(cat);
  const todayKeys = new Set(cat.today.map((c) => c.key));
  // a hall-level lean so halls end up with real differences, then each dish's own appeal with noise
  const hallLean = Object.fromEntries(HALL_IDS.map((h) => [h, gauss(r) * 0.3])) as Record<HallId, number>;
  const appeal = new Map(dishes.map((d) => [d.key, appealOf(d.name) + hallLean[d.hallId] + gauss(r) * 0.35]));
  for (const h of HALL_IDS) { // every hall gets a standout, a main or a dessert when the hall has one
    const atHall = dishes.filter((d) => d.hallId === h);
    const mains = atHall.filter((d) => appealOf(d.name) >= 0.9);
    const star = (mains.length ? mains : atHall).sort((a, b) => appeal.get(b.key)! - appeal.get(a.key)!)[0];
    if (star) appeal.set(star.key, appeal.get(star.key)! + 0.7);
  }
  const stats = new Map<DishKey, DishStat>(dishes.map((d) => [d.key, baseStat(d, d)]));
  const collegeWeight = Object.fromEntries(COLLEGES.map((c) => [c, 0.35 + r() * 1.3])) as Record<College, number>;
  const colleges: Partial<Record<College, number>> = {};
  const byHall = Object.fromEntries(HALL_IDS.map((h) => [h, dishes.filter((d) => d.hallId === h)])) as Record<HallId, CatalogDish[]>;
  const halls = HALL_IDS.filter((h) => byHall[h].length >= 2);
  const pickWeight = (d: CatalogDish) => (dishPhoto(d.name) ? 2 : 1) * (todayKeys.has(d.key) ? 1.5 : 1);

  const vote = (w: CatalogDish, l: CatalogDish, college?: College) => {
    const a = stats.get(w.key)!, b = stats.get(l.key)!;
    const e = calculateElo(a.elo, b.elo, undefined, a.votes, b.votes);
    stats.set(w.key, { ...a, elo: e.newWinnerElo, votes: a.votes + 1, wins: a.wins + 1 });
    stats.set(l.key, { ...b, elo: e.newLoserElo, votes: b.votes + 1 });
    if (college) colleges[college] = (colleges[college] ?? 0) + 1;
  };
  const collegeFor = (hallId: HallId): College | undefined => {
    if (r() > 0.8) return undefined; // not every voter has set up a profile
    const local = HALLS.find((h) => h.id === hallId)!.colleges;
    return weighted(r() < 0.65 ? local : COLLEGES, (c) => collegeWeight[c], r);
  };

  if (halls.length === 0 || dishes.length < 2) return null;
  for (let i = 0; i < MATCHUPS; i++) {
    let a: CatalogDish, b: CatalogDish;
    if (r() < 0.75 || halls.length < 2) {
      const h = weighted(halls, (x) => byHall[x].length, r);
      a = weighted(byHall[h], pickWeight, r);
      b = weighted(byHall[h].filter((d) => d !== a), pickWeight, r);
    } else {
      const h1 = weighted(halls, (x) => byHall[x].length, r);
      const h2 = weighted(halls.filter((x) => x !== h1), (x) => byHall[x].length, r);
      a = weighted(byHall[h1], pickWeight, r);
      b = weighted(byHall[h2], pickWeight, r);
    }
    const pa = appeal.get(a.key)!, pb = appeal.get(b.key)!;
    if (r() < 0.04 + (Math.min(pa, pb) < -1 ? 0.12 : 0)) { // "Haven't tried these"
      for (const d of [a, b]) { const s = stats.get(d.key)!; stats.set(d.key, { ...s, skips: s.skips + 1 }); }
      continue;
    }
    const aWins = r() < 1 / (1 + Math.exp(-1.5 * (pa - pb)));
    const [w, l] = aWins ? [a, b] : [b, a];
    vote(w, l, collegeFor(w.hallId));
  }

  // the live round: two well-ranked dishes on today's menus with photos, from different halls when possible
  const ranked = mergeDishes(cat.today, Object.fromEntries(stats));
  const byKey = new Map(cat.today.map((c) => [c.key, c]));
  const names = new Set<string>();
  const pool = ranked.map((d) => byKey.get(dishKey(d.hallId, d.recipeId)))
    .filter((c): c is CatalogDish => !!c && !!dishPhoto(c.name) && !names.has(c.name) && !!names.add(c.name)).slice(0, 10);
  let round: LiveRound | null = null;
  if (pool.length >= 2) {
    const first = pool[Math.min(pool.length - 2, 1 + Math.floor(r() * 4))];
    const rest = pool.filter((c) => c !== first).slice(1);
    const second = rest.find((c) => c.hallId !== first.hallId) ?? rest[0] ?? pool.find((c) => c !== first)!;
    const side = (c: CatalogDish): LiveSide => ({ key: c.key, recipeId: c.recipeId, name: c.name, hallId: c.hallId });
    for (const c of [first, second]) if (!stats.has(c.key)) stats.set(c.key, baseStat(c, c));
    const aVotes = 10 + Math.floor(r() * 8), bVotes = aVotes - 1 - Math.floor(r() * 5); // a close race, so neither side looks like a flop
    // the ballots are real matchups too, interleaved the way phones would send them
    for (let ax = 0, bx = 0; ax + bx < aVotes + bVotes;) {
      const takeA = bx >= bVotes || (ax < aVotes && r() < aVotes / (aVotes + bVotes));
      if (takeA) { vote(first, second, collegeFor(first.hallId)); ax++; } else { vote(second, first, collegeFor(second.hallId)); bx++; }
    }
    round = { roundId: `demo${hash(cat.week + seed).toString(36)}`, a: side(first), b: side(second), aVotes, bVotes, startedAt: `${cat.date}T19:00:00.000Z` };
  }

  // a clear #1 at every hall: the gap from first to second, at the hall where it is smallest
  const gap = Math.min(...halls.map((h) => {
    const e = [...stats.values()].filter((s) => s.hallId === h).map((s) => s.elo).sort((x, y) => y - x);
    return e.length > 1 ? e[0] - e[1] : 99;
  }));
  return { stats, colleges, round, gap };
}

/** The whole mock week. Tries a few fixed seeds and keeps the first where every hall has a clear #1 (the result never changes for
 *  the same catalog). */
export function buildDemo(cat: DemoCatalog): Store {
  let best: ReturnType<typeof simulate> = null;
  for (let s = 1; s <= 40; s++) {
    const sim = simulate(cat, hash(`sluggrub-demo-${s}`));
    if (sim && (!best || sim.gap > best.gap)) best = sim;
    if (best && best.gap >= 12) break;
  }
  const dishes = Object.fromEntries(best?.stats ?? []);
  // opening board: today's standings with two neighbouring pairs swapped, so the week shows some movement
  const order = hallStandings(mergeDishes(cat.today, dishes), null).map((h) => h.hallId);
  if (order.length >= 3) [order[1], order[2]] = [order[2], order[1]];
  if (order.length >= 5) [order[3], order[4]] = [order[4], order[3]];
  const opening = Object.fromEntries(order.map((h, i) => [h, i + 1])) as Partial<Record<HallId, number>>;
  return {
    state: { week: cat.week, dishes, colleges: best?.colleges ?? {}, opening, round: best?.round ?? null, myBallot: null },
    today: cat.today,
    votes: new Map(),
    skips: new Set(),
  };
}

/* ── The live store ── */
let loading: Promise<Store> | null = null;
let store: Store | null = null;
const listeners = new Set<(s: Store) => void>();

function load(): Promise<Store> {
  loading ??= fetch("/api/demo", { cache: "no-store" })
    .then((res) => { if (!res.ok) throw new Error(String(res.status)); return res.json() as Promise<DemoCatalog>; })
    .then((cat) => (store = buildDemo(cat)))
    .catch((err) => { loading = null; throw err; });
  return loading;
}

const ok = (delta?: number): Outcome => ({ ok: true, delta });
const no = (error: "already" | "round-over" | "not-found", message: string): Outcome => ({ ok: false, error, message });

/** Replace the state and tell every screen (a new object each time, as a snapshot would be). */
function commit(next: Partial<RankState>) {
  if (!store) return;
  store.state = { ...store.state, ...next };
  listeners.forEach((l) => l(store!));
}

function statOf(s: Store, ref: DishRef, dishes: Record<DishKey, DishStat>): DishStat {
  const key = dishKey(ref.hallId, ref.recipeId);
  return dishes[key] ?? baseStat(ref, s.today.find((c) => c.key === key));
}

function applyVote(s: Store, id: string, winner: DishRef, loser: DishRef, college?: College): { delta: number; dishes: Record<DishKey, DishStat>; colleges: RankState["colleges"] } {
  const dishes = { ...s.state.dishes };
  const w = statOf(s, winner, dishes), l = statOf(s, loser, dishes);
  const e = calculateElo(w.elo, l.elo, undefined, w.votes, l.votes);
  const wk = dishKey(w.hallId, w.recipeId), lk = dishKey(l.hallId, l.recipeId);
  dishes[wk] = { ...w, elo: e.newWinnerElo, votes: w.votes + 1, wins: w.wins + 1 };
  dishes[lk] = { ...l, elo: e.newLoserElo, votes: l.votes + 1 };
  s.votes.set(id, { winner: wk, loser: lk, delta: e.winnerDelta, college });
  const colleges = { ...s.state.colleges };
  if (college) colleges[college] = (colleges[college] ?? 0) + 1;
  return { delta: e.winnerDelta, dishes, colleges };
}

/** The same calls as rankClient's Firebase and local backends, on the in-memory demo copy. */
export const demoBackend = {
  subscribe(_week: string, onState: (s: RankState) => void, onError: (msg: string) => void): () => void {
    let stop = false;
    const l = (s: Store) => { if (!stop) onState(s.state); };
    load().then((s) => { if (stop) return; listeners.add(l); onState(s.state); }, () => { if (!stop) onError("Rankings could not load"); });
    return () => { stop = true; listeners.delete(l); };
  },
  async vote(winner: DishRef, loser: DishRef, matchId: string, college?: College): Promise<Outcome> {
    const s = await load();
    if (s.votes.has(matchId)) return no("already", "Already counted from this phone");
    const { delta, dishes, colleges } = applyVote(s, matchId, winner, loser, college);
    commit({ dishes, colleges });
    return ok(delta);
  },
  async undo(matchId: string): Promise<Outcome> {
    const s = await load();
    const v = s.votes.get(matchId);
    if (!v || matchId.startsWith("live-")) return no("not-found", "Nothing to undo");
    const dishes = { ...s.state.dishes };
    const w = dishes[v.winner], l = dishes[v.loser];
    if (w) dishes[v.winner] = { ...w, elo: w.elo - v.delta, votes: Math.max(0, w.votes - 1), wins: Math.max(0, w.wins - 1) };
    if (l) dishes[v.loser] = { ...l, elo: l.elo + v.delta, votes: Math.max(0, l.votes - 1) };
    const colleges = { ...s.state.colleges };
    if (v.college) colleges[v.college] = Math.max(0, (colleges[v.college] ?? 0) - 1);
    s.votes.delete(matchId);
    commit({ dishes, colleges });
    return ok(v.delta);
  },
  async skip(a: DishRef, b: DishRef, matchId: string): Promise<Outcome> {
    const s = await load();
    if (s.skips.has(matchId)) return no("already", "Already counted from this phone");
    s.skips.add(matchId);
    const dishes = { ...s.state.dishes };
    for (const ref of [a, b]) { const st = statOf(s, ref, dishes); dishes[dishKey(st.hallId, st.recipeId)] = { ...st, skips: st.skips + 1 }; }
    commit({ dishes });
    return ok();
  },
  async startRound(a: DishRef, b: DishRef): Promise<Outcome> {
    await load();
    const side = (r: DishRef): LiveSide => ({ key: dishKey(r.hallId, r.recipeId), recipeId: r.recipeId, name: r.name, hallId: r.hallId });
    commit({ round: { roundId: `demo${Date.now().toString(36)}`, a: side(a), b: side(b), aVotes: 0, bVotes: 0, startedAt: new Date().toISOString() }, myBallot: null });
    return ok();
  },
  async ballot(roundId: string, side: "a" | "b", college?: College): Promise<Outcome> {
    const s = await load();
    const round = s.state.round;
    if (!round || round.roundId !== roundId) return no("round-over", "That round just ended");
    const id = liveMatchId(roundId);
    if (s.votes.has(id)) return no("already", "Already counted from this phone");
    const [winner, loser] = side === "a" ? [round.a, round.b] : [round.b, round.a];
    const { delta, dishes, colleges } = applyVote(s, id, winner, loser, college);
    commit({ dishes, colleges, myBallot: side, round: { ...round, aVotes: round.aVotes + (side === "a" ? 1 : 0), bVotes: round.bVotes + (side === "b" ? 1 : 0) } });
    return ok(delta);
  },
  async openWeek(): Promise<void> { /* the mock week opens itself */ },
};

/** For screens whose rankings come from the server (Today, Halls): the demo state and today's catalog when demo mode is on, else
 *  null. Call `on` from useDemoMode(). */
export function useDemoRank(on: boolean): { state: RankState; today: CatalogDish[] } | null {
  const [snap, setSnap] = useState<{ state: RankState; today: CatalogDish[] } | null>(null);
  useEffect(() => {
    if (!on) return;
    let stop = false;
    const l = (s: Store) => { if (!stop) setSnap({ state: s.state, today: s.today }); };
    load().then((s) => { if (stop) return; listeners.add(l); l(s); }, () => { /* demo data could not load: the server's numbers stay */ });
    return () => { stop = true; listeners.delete(l); };
  }, [on]);
  return on ? snap : null;
}
