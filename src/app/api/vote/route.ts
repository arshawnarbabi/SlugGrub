// Owner: Karen. Local fallback (no Firebase config): every ranking write goes through here, into the in-memory store.
// Same rules the Firestore path enforces (firestore.rules): one vote per voter per matchup per day, one ballot per device per live
// round, dishes must be on the menus (or already ranked), counters move by one. Not shared across Vercel instances.
import { connection } from "next/server";
import { getCatalog, campusDate } from "@/lib/rankCatalog";
import { memBallot, memSkip, memStartRound, memState, memUndo, memVote, type StoreResult } from "@/lib/rankMemory";
import { dishKey, isCollege, isDishRef, weekOf, type DishRef } from "@/lib/rankCore";

const VOTER = /^[A-Za-z0-9_-]{8,64}$/;
const MATCH = /^[A-Za-z0-9_-]{4,200}$/;

const reply = (r: StoreResult) => Response.json(r, { status: r.ok ? 200 : r.error === "invalid" ? 400 : 409 });
const invalid = () => reply({ ok: false, error: "invalid" });

export async function POST(req: Request) {
  await connection();
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return invalid(); }
  const date = campusDate();
  const week = weekOf(date);
  const catalog = (await getCatalog(date)).dishes;
  const known = new Set([...catalog.map((c) => c.key), ...Object.keys(memState(catalog, week).dishes)]);
  const knows = (r: DishRef) => known.has(dishKey(r.hallId, r.recipeId));
  const voter = typeof body.voter === "string" && VOTER.test(body.voter) ? body.voter : null;
  const matchId = typeof body.matchId === "string" && MATCH.test(body.matchId) ? body.matchId : null;
  const college = isCollege(body.college) ? body.college : undefined;

  switch (body.action) {
    case "vote": {
      const { winner, loser } = body;
      if (!voter || !matchId || !isDishRef(winner) || !isDishRef(loser) || !knows(winner) || !knows(loser)) return invalid();
      if (dishKey(winner.hallId, winner.recipeId) === dishKey(loser.hallId, loser.recipeId)) return invalid();
      return reply(memVote(catalog, { voter, matchId, winner, loser, week, college }));
    }
    case "undo":
      if (!voter || !matchId) return invalid();
      return reply(memUndo({ voter, matchId, week }));
    case "skip": {
      const { a, b } = body;
      if (!voter || !matchId || !isDishRef(a) || !isDishRef(b) || !knows(a) || !knows(b)) return invalid();
      return reply(memSkip(catalog, { voter, matchId, a, b }));
    }
    case "round": {
      const { a, b, roundId } = body;
      if (!isDishRef(a) || !isDishRef(b) || !knows(a) || !knows(b) || typeof roundId !== "string" || !MATCH.test(roundId)) return invalid();
      const side = (r: DishRef) => ({ key: dishKey(r.hallId, r.recipeId), recipeId: r.recipeId, name: r.name, hallId: r.hallId });
      if (side(a).key === side(b).key) return invalid();
      return reply(memStartRound(side(a), side(b), roundId));
    }
    case "ballot": {
      const { roundId, side } = body;
      if (!voter || typeof roundId !== "string" || (side !== "a" && side !== "b")) return invalid();
      return reply(memBallot(catalog, { voter, roundId, side, week, college }));
    }
    default:
      return invalid();
  }
}
