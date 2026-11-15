// Owner: Karen. Browser side of rankings: live state and every vote, in one of two modes.
//   firebase (NEXT_PUBLIC_FIREBASE_* set): Firestore onSnapshot for live state, runTransaction for every write (concurrent phones
//     never overwrite each other), anonymous sign-in for one vote per device. UNVERIFIED until a project is configured.
//   local (no config): the in-memory store behind /api/vote on this one server, polled about every 2 s. Works across tabs and
//     phones on the same server; NOT shared across Vercel instances.
// Writes are never awaited by the UI before it moves on: screens show the result at once and report a save failure after.
import { useEffect, useRef, useState } from "react";
import {
  collection, doc, getDoc, increment, onSnapshot, runTransaction, setDoc,
  type DocumentReference, type Firestore, type Transaction,
} from "firebase/firestore";
import type { College, HallId } from "./types";
import { calculateElo } from "./elo";
import { getDb, firebaseConfigured } from "./firebase";
import { ensureUser } from "./auth";
import {
  baseStat, dishKey, emptyState, hallStandings, isCollege, isHallId, liveMatchId, mergeDishes, ranksOf, voteDocId, weekOf,
  type CatalogDish, type DishRef, type DishStat, type LiveRound, type RankState,
} from "./rankCore";
import { campusNow } from "@/components/screens/now";
import { demoOn } from "./demoMode";
import { demoBackend } from "./rankDemo";

export type RankMode = "firebase" | "local";
export const rankMode: RankMode = firebaseConfigured ? "firebase" : "local";

export type Outcome =
  | { ok: true; delta?: number }
  | { ok: false; error: "already" | "invalid" | "round-over" | "not-found" | "offline" | "failed"; message: string };

const MESSAGES: Record<Exclude<Outcome, { ok: true }>["error"], string> = {
  already: "Already counted from this phone",
  invalid: "That vote could not be read",
  "round-over": "That round just ended",
  "not-found": "Nothing to undo",
  offline: "Not saved: you look offline",
  failed: "Not saved: the server said no",
};
const fail = (error: keyof typeof MESSAGES): Outcome => ({ ok: false, error, message: MESSAGES[error] });

/* ── The student's onboarding profile (college, usual hall), stored on this device by onboarding ── */
export interface Profile { college?: College; usualHall?: HallId }
// The onboarding owner's key first, then the dotted form; neither present means no profile yet.
const PROFILE_KEYS = ["sluggrub_profile", "sluggrub.profile"];
export function readProfile(): Profile {
  if (typeof window === "undefined") return {};
  for (const k of PROFILE_KEYS) {
    try {
      const raw = window.localStorage.getItem(k);
      if (!raw) continue;
      const p = JSON.parse(raw) as Record<string, unknown>;
      return { college: isCollege(p.college) ? p.college : undefined, usualHall: isHallId(p.usualHall) ? p.usualHall : undefined };
    } catch { /* unreadable profile: treat as none */ }
  }
  return {};
}

/* ── Who is voting: the Firebase uid, or (local mode) a random id kept on this device ── */
function deviceId(): string {
  const KEY = "sluggrub.device";
  try {
    const have = window.localStorage.getItem(KEY);
    if (have && /^[A-Za-z0-9]{16,64}$/.test(have)) return have;
    const id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 20);
    window.localStorage.setItem(KEY, id);
    return id;
  } catch {
    return "anon" + Math.random().toString(36).slice(2, 18);
  }
}
async function voterId(): Promise<string> {
  if (rankMode === "local") return deviceId();
  const u = await ensureUser();
  if (!u) throw new Error("no user");
  return u.uid;
}

export const campusToday = () => campusNow(new Date()).date;
export const currentWeek = () => weekOf(campusToday());

type Ref = DishRef & { base?: { elo: number } };

interface Backend {
  subscribe(week: string, onState: (s: RankState) => void, onError: (msg: string) => void): () => void;
  vote(winner: Ref, loser: Ref, matchId: string, college?: College): Promise<Outcome>;
  undo(matchId: string): Promise<Outcome>;
  skip(a: Ref, b: Ref, matchId: string): Promise<Outcome>;
  startRound(a: DishRef, b: DishRef): Promise<Outcome>;
  ballot(roundId: string, side: "a" | "b", college?: College): Promise<Outcome>;
  openWeek(week: string, ranks: Partial<Record<HallId, number>>): Promise<void>;
}

/* ── Local mode: /api/vote + polling ── */
const kicks = new Set<() => void>();
const kick = () => kicks.forEach((k) => k());

const local: Backend = {
  subscribe(_week, onState, onError) {
    let stop = false;
    let timer = 0;
    const poll = async () => {
      window.clearTimeout(timer);
      if (stop) return;
      try {
        const res = await fetch(`/api/vote/state?voter=${encodeURIComponent(deviceId())}`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error(String(res.status));
        if (!stop) onState((await res.json()) as RankState);
      } catch {
        if (!stop) onError("Live results paused: can't reach the server");
      }
      if (!stop && document.visibilityState === "visible") timer = window.setTimeout(poll, 2000);
    };
    const onVis = () => { if (document.visibilityState === "visible") poll(); };
    document.addEventListener("visibilitychange", onVis);
    kicks.add(poll);
    poll();
    return () => { stop = true; window.clearTimeout(timer); kicks.delete(poll); document.removeEventListener("visibilitychange", onVis); };
  },
  vote: async (winner, loser, matchId, college) => post({ action: "vote", voter: deviceId(), matchId, winner: plain(winner), loser: plain(loser), college }),
  undo: async (matchId) => post({ action: "undo", voter: deviceId(), matchId }),
  skip: async (a, b, matchId) => post({ action: "skip", voter: deviceId(), matchId, a: plain(a), b: plain(b) }),
  startRound: async (a, b) => post({ action: "round", a: plain(a), b: plain(b), roundId: newRoundId() }),
  ballot: async (roundId, side, college) => post({ action: "ballot", voter: deviceId(), roundId, side, college }),
  openWeek: async () => { /* the server opens the week itself */ },
};

const plain = (r: DishRef): DishRef => ({ recipeId: r.recipeId, name: r.name, hallId: r.hallId });
const newRoundId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function post(body: Record<string, unknown>): Promise<Outcome> {
  try {
    const res = await fetch("/api/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });
    const r = (await res.json().catch(() => null)) as Outcome | { ok: false; error: keyof typeof MESSAGES } | null;
    kick();
    if (!r) return fail("failed");
    return r.ok ? r : fail(r.error in MESSAGES ? r.error : "failed");
  } catch {
    return fail("offline");
  }
}

/* ── Firebase mode: onSnapshot + runTransaction (UNVERIFIED until a project is configured) ── */
class Stop extends Error { constructor(public code: keyof typeof MESSAGES) { super(code); } }

function firebaseBackend(db: Firestore): Backend {
  const dishRef = (r: DishRef) => doc(db, "dishes", dishKey(r.hallId, r.recipeId)) as DocumentReference<DishStat>;
  const voteRef = (id: string) => doc(db, "votes", id);
  const collegeRef = (week: string, c: College) => doc(db, "rivalry", week, "colleges", c);
  const liveRef = doc(db, "live", "current");

  // A write that cannot reach the server would retry for a long time: give up after 10 s and say so.
  const run = async (fn: (uid: string) => Promise<number | undefined>): Promise<Outcome> => {
    try {
      const uid = await voterId();
      const delta = await Promise.race([fn(uid), new Promise<never>((_, rej) => setTimeout(() => rej(new Stop("offline")), 10000))]);
      return { ok: true, delta };
    } catch (err) {
      if (err instanceof Stop) return fail(err.code);
      const code = typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "";
      console.warn("[rankings] save failed:", err);
      return fail(code === "unavailable" || code === "deadline-exceeded" || (typeof navigator !== "undefined" && !navigator.onLine) ? "offline" : "failed");
    }
  };

  const read = async (tx: Transaction, r: Ref) => {
    const snap = await tx.get(dishRef(r));
    return snap.exists() ? snap.data() : baseStat(r, r.base ? ({ base: r.base } as CatalogDish) : undefined);
  };
  const write = (tx: Transaction, s: DishStat) =>
    tx.set(dishRef(s), { recipeId: s.recipeId, name: s.name, hallId: s.hallId, elo: s.elo, votes: s.votes, wins: s.wins, skips: s.skips, lastVoteId: s.lastVoteId ?? "", lastSkipId: s.lastSkipId ?? "" });

  // One vote: both dishes' Elo, the vote record and the college counter, all in one transaction.
  const applyVote = async (tx: Transaction, id: string, matchId: string, uid: string, winner: Ref, loser: Ref, college?: College) => {
    const v = await tx.get(voteRef(id));
    if (v.exists()) throw new Stop("already");
    const [w, l] = [await read(tx, winner), await read(tx, loser)];
    const r = calculateElo(w.elo, l.elo, undefined, w.votes, l.votes);
    write(tx, { ...w, elo: r.newWinnerElo, votes: w.votes + 1, wins: w.wins + 1, lastVoteId: id });
    write(tx, { ...l, elo: r.newLoserElo, votes: l.votes + 1, lastVoteId: id });
    tx.set(voteRef(id), {
      winnerRecipeId: w.recipeId, loserRecipeId: l.recipeId, winnerHallId: w.hallId, loserHallId: l.hallId,
      userId: uid, matchId, delta: r.winnerDelta, at: new Date().toISOString(), ...(college ? { college } : {}),
    });
    if (college) tx.set(collegeRef(currentWeek(), college), { votes: increment(1), lastVoteId: id }, { merge: true });
    return r.winnerDelta;
  };

  return {
    subscribe(week, onState, onError) {
      const state = emptyState(week);
      const seen = new Set<string>();
      let uid: string | null = null;
      let ballotFor = "";
      const emit = (part: string) => { seen.add(part); if (seen.size >= 4) onState({ ...state }); };
      const checkBallot = async () => {
        const round = state.round;
        if (!round) { state.myBallot = null; return; }
        if (ballotFor === round.roundId) return;
        ballotFor = round.roundId;
        try {
          uid ??= await voterId();
          const v = await getDoc(voteRef(voteDocId(uid, liveMatchId(round.roundId))));
          state.myBallot = v.exists() ? (v.data().winnerRecipeId === round.a.recipeId && v.data().winnerHallId === round.a.hallId ? "a" : "b") : null;
          emit("live");
        } catch { /* not signed in yet: no ballot shown */ }
      };
      const err = () => onError("Live results paused: can't reach Firebase");
      const subs = [
        onSnapshot(collection(db, "dishes"), (s) => { state.dishes = Object.fromEntries(s.docs.map((d) => [d.id, d.data() as DishStat])); emit("dishes"); }, err),
        onSnapshot(collection(db, "rivalry", week, "colleges"), (s) => { state.colleges = Object.fromEntries(s.docs.map((d) => [d.id, Number(d.data().votes ?? 0)])); emit("colleges"); }, err),
        onSnapshot(doc(db, "boards", week), (s) => { state.opening = s.exists() ? (s.data().ranks ?? null) : null; emit("board"); }, err),
        onSnapshot(liveRef, (s) => { state.round = s.exists() ? (s.data() as LiveRound) : null; emit("live"); checkBallot(); }, err),
      ];
      return () => subs.forEach((u) => u());
    },
    vote: (winner, loser, matchId, college) => run((uid) => runTransaction(db, (tx) => applyVote(tx, voteDocId(uid, matchId), matchId, uid, winner, loser, college))),
    undo: (matchId) => run((uid) => runTransaction(db, async (tx) => {
      const id = voteDocId(uid, matchId);
      const v = await tx.get(voteRef(id));
      if (!v.exists() || matchId.startsWith("live-")) throw new Stop("not-found");
      const vote = v.data() as { winnerRecipeId: string; loserRecipeId: string; winnerHallId: HallId; loserHallId: HallId; delta: number; college?: College };
      const wRef = dishRef({ recipeId: vote.winnerRecipeId, hallId: vote.winnerHallId, name: "" });
      const lRef = dishRef({ recipeId: vote.loserRecipeId, hallId: vote.loserHallId, name: "" });
      const [w, l] = [await tx.get(wRef), await tx.get(lRef)];
      if (w.exists()) write(tx, { ...w.data(), elo: w.data().elo - vote.delta, votes: Math.max(0, w.data().votes - 1), wins: Math.max(0, w.data().wins - 1), lastVoteId: id });
      if (l.exists()) write(tx, { ...l.data(), elo: l.data().elo + vote.delta, votes: Math.max(0, l.data().votes - 1), lastVoteId: id });
      tx.delete(voteRef(id));
      if (vote.college) tx.set(collegeRef(currentWeek(), vote.college), { votes: increment(-1), lastVoteId: id }, { merge: true });
      return vote.delta;
    })),
    skip: (a, b, matchId) => run((uid) => runTransaction(db, async (tx) => {
      const id = voteDocId(uid, matchId);
      const s = await tx.get(doc(db, "skips", id));
      if (s.exists()) throw new Stop("already");
      const [da, db2] = [await read(tx, a), await read(tx, b)];
      write(tx, { ...da, skips: da.skips + 1, lastSkipId: id });
      write(tx, { ...db2, skips: db2.skips + 1, lastSkipId: id });
      tx.set(doc(db, "skips", id), { userId: uid, a: dishKey(a.hallId, a.recipeId), b: dishKey(b.hallId, b.recipeId), at: new Date().toISOString() });
      return undefined;
    })),
    startRound: (a, b) => run(async () => {
      const side = (r: DishRef) => ({ key: dishKey(r.hallId, r.recipeId), ...plain(r) });
      await setDoc(liveRef, { roundId: newRoundId(), a: side(a), b: side(b), aVotes: 0, bVotes: 0, startedAt: new Date().toISOString() });
      return undefined;
    }),
    ballot: (roundId, side, college) => run((uid) => runTransaction(db, async (tx) => {
      const live = await tx.get(liveRef);
      const round = live.exists() ? (live.data() as LiveRound) : null;
      if (!round || round.roundId !== roundId) throw new Stop("round-over");
      const matchId = liveMatchId(roundId);
      const [winner, loser] = side === "a" ? [round.a, round.b] : [round.b, round.a];
      const id = voteDocId(uid, matchId);
      const v = await tx.get(voteRef(id));
      if (v.exists()) throw new Stop("already");
      // every read happens before the first write (a Firestore transaction rule)
      const [w, l] = [await read(tx, winner), await read(tx, loser)];
      const r = calculateElo(w.elo, l.elo, undefined, w.votes, l.votes);
      write(tx, { ...w, elo: r.newWinnerElo, votes: w.votes + 1, wins: w.wins + 1, lastVoteId: id });
      write(tx, { ...l, elo: r.newLoserElo, votes: l.votes + 1, lastVoteId: id });
      tx.set(voteRef(id), {
        winnerRecipeId: w.recipeId, loserRecipeId: l.recipeId, winnerHallId: w.hallId, loserHallId: l.hallId,
        userId: uid, matchId, delta: r.winnerDelta, at: new Date().toISOString(), ...(college ? { college } : {}),
      });
      if (college) tx.set(collegeRef(currentWeek(), college), { votes: increment(1), lastVoteId: id }, { merge: true });
      tx.update(liveRef, side === "a" ? { aVotes: round.aVotes + 1 } : { bVotes: round.bVotes + 1 });
      return r.winnerDelta;
    })),
    async openWeek(week, ranks) {
      try {
        await ensureUser();
        await setDoc(doc(db, "boards", week), { ranks, at: new Date().toISOString() });
      } catch { /* another phone opened the week first (create-only): fine */ }
    },
  };
}

let backend: Backend | null = null;
export function rankBackend(): Backend {
  // demo mode (?demo=1, src/lib/demoMode.ts): mock state in this browser only; nothing is read from or written to Firebase
  if (demoOn()) return demoBackend;
  if (!backend) {
    const db = rankMode === "firebase" ? getDb() : null;
    backend = db ? firebaseBackend(db) : local;
  }
  return backend;
}

/** Live ranking state for a screen. `catalog` (today's menus) lets Firebase mode open the week's board. */
export function useRankState(catalog: CatalogDish[]): { state: RankState | null; error: string | null } {
  const [state, setState] = useState<RankState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const opened = useRef("");
  const catalogRef = useRef(catalog);
  useEffect(() => { catalogRef.current = catalog; }, [catalog]);
  useEffect(() => {
    const week = currentWeek();
    return rankBackend().subscribe(
      week,
      (s) => {
        setState(s);
        setError(null);
        if (rankMode === "firebase" && !demoOn() && s.opening === null && opened.current !== week) {
          opened.current = week;
          const all = mergeDishes(catalogRef.current, s.dishes);
          rankBackend().openWeek(week, ranksOf(hallStandings(all, null), all));
        }
      },
      setError,
    );
  }, []);
  return { state, error };
}
