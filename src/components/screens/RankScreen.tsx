"use client";

// Owner: Arshawn (UI). Karen's data: dishes from today's real menus (props), live Elo and standings from rankClient.
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { QrCodeIcon, Tick02Icon, Undo02Icon, ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { Seg, Swap, Appear, SPRING, STATE_IN, STATE_OUT, STATE_FADE } from "@/components/ui/motion";
import { calculateElo, getSmartMatchup } from "@/lib/elo";
import type { College, DishRank, HallId, MealName } from "@/lib/types";
import {
  baseStat, collegeStandings, hallStandings, matchIdFor, mergeDishes,
  type CatalogDish, type DishStat, type RankState,
} from "@/lib/rankCore";
import { rankBackend, readProfile, useRankState } from "@/lib/rankClient";
import { dishPhoto } from "./dishPhoto";
import { campusNow, hoursFor, mealLabel, mealToLog } from "./now";
import { DishThumb, hallColor, hallShort, shortDate } from "./rankBits";

const VIEWS = ["This or that", "Leaderboard"] as const;
type View = (typeof VIEWS)[number];

export function RankScreen({ catalog }: { catalog: CatalogDish[] }) {
  const [view, setView] = useState<View>("This or that");
  const { state, error } = useRankState(catalog);
  // ?view=Leaderboard (from Today's college card) is read on the client so the route stays static
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") === "Leaderboard") setView("Leaderboard");
  }, []);
  return (
    <Screen top={<div className="topbar">
        <h1 className="title-xl">Rank</h1>
        <Link href="/vote" className="iconbtn" aria-label="Live vote"><Icon icon={QrCodeIcon} size={18} /></Link>
      </div>}>
<Seg options={VIEWS} value={view} onChange={setView} label="Rank view" />
      {view === "This or that" ? <Appear id="duel"><Duels catalog={catalog} state={state} /></Appear> : <Appear id="board"><Board catalog={catalog} state={state} /></Appear>}
      {error && <Appear id="err"><div className="label" style={{ fontSize: 12, textAlign: "center" }}>{error}</div></Appear>}
    </Screen>
  );
}

type Pair = [CatalogDish, CatalogDish];
type Last = { winner: CatalogDish; delta: number; matchId: string; status: "saving" | "saved" | "already" | "error"; message?: string; retry?: () => void };
type Ctx = { hallId: HallId; meal: MealName; date: string; college?: College };

const statFor = (state: RankState | null, d: CatalogDish): DishStat => state?.dishes[d.key] ?? baseStat(d, d);

/** Who and when: the student's usual hall and college (onboarding), and the meal that last opened there (you rank after eating). */
function readCtx(): Ctx {
  const p = readProfile();
  const hallId = p.usualHall ?? "40"; // no profile yet: JRL/C9
  const now = campusNow(new Date());
  return { hallId, meal: mealToLog(hoursFor(hallId, now.date), now.minutes), date: now.date, college: p.college };
}

/** Dishes to pair: this meal at your hall (ones with photos first), widening to your hall today, then campus. */
function poolFor(catalog: CatalogDish[], ctx: Ctx): CatalogDish[] {
  const hall = catalog.filter((c) => c.hallId === ctx.hallId);
  const meal = hall.filter((c) => c.meals.includes(ctx.meal));
  for (const list of [meal, hall, catalog]) {
    const withPhoto = list.filter((c) => dishPhoto(c.name));
    if (withPhoto.length >= 2) return withPhoto;
    if (list.length >= 2) return list;
  }
  return catalog;
}

function nextPair(pool: CatalogDish[], state: RankState | null, avoid?: Pair): Pair | null {
  const ranks: DishRank[] = pool.map((c) => { const s = statFor(state, c); return { recipeId: c.key, name: c.name, hallId: c.hallId, elo: s.elo, votes: s.votes }; });
  const byKey = new Map(pool.map((c) => [c.key, c]));
  let best: Pair | null = null;
  for (let t = 0; t < 6; t++) {
    const m = getSmartMatchup(ranks);
    if (!m) return null;
    best = [byKey.get(m[0].recipeId)!, byKey.get(m[1].recipeId)!];
    const same = avoid && new Set([avoid[0].key, avoid[1].key, best[0].key, best[1].key]).size === 2;
    if (!same) break;
  }
  return best;
}

function Duels({ catalog, state }: { catalog: CatalogDish[]; state: RankState | null }) {
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<0 | 1 | null>(null);
  const [last, setLast] = useState<Last | null>(null);
  const [ranked, setRanked] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const pool = useMemo(() => (ctx ? poolFor(catalog, ctx) : []), [catalog, ctx]);

  // the clock and this device's profile are read after mount (pages open static; no clock during render)
  useEffect(() => { setCtx(readCtx()); }, []);
  useEffect(() => {
    if (pool.length >= 2 && pairs.length === 0) { const p = nextPair(pool, stateRef.current); if (p) setPairs([p]); }
  }, [pool, pairs.length]);

  const pair = pairs[i];
  const tr = reduce ? { duration: 0 } : SPRING;
  const advance = () => {
    setPick(null);
    setPairs((ps) => {
      if (i + 1 < ps.length) return ps;
      const p = nextPair(pool, stateRef.current, ps[i]);
      return p ? [...ps, p] : ps;
    });
    setI((n) => n + 1);
  };

  const save = (winner: CatalogDish, loser: CatalogDish, matchId: string) => {
    rankBackend().vote(winner, loser, matchId, ctx?.college).then((o) => {
      setLast((cur) => {
        if (!cur || cur.matchId !== matchId) return cur;
        if (o.ok) return { ...cur, status: "saved", delta: o.delta ?? cur.delta, message: undefined };
        return { ...cur, status: o.error === "already" ? "already" : "error", message: o.error === "already" ? "Already counted from this phone today" : o.message, retry: o.error === "already" ? undefined : () => { setLast({ ...cur, status: "saving", message: undefined }); save(winner, loser, matchId); } };
      });
      if (!o.ok && o.error === "already") setRanked((n) => Math.max(0, n - 1));
    });
  };

  const choose = (k: 0 | 1) => {
    if (!pair || !ctx || pick !== null) return;
    const [winner, loser] = k === 0 ? [pair[0], pair[1]] : [pair[1], pair[0]];
    const w = statFor(state, winner), l = statFor(state, loser);
    const shown = calculateElo(w.elo, l.elo, undefined, w.votes, l.votes).winnerDelta; // shown at once; the store's number replaces it
    const matchId = matchIdFor(ctx.date, winner.key, loser.key);
    setPick(k);
    setNote(null);
    setRanked((n) => n + 1);
    setLast({ winner, delta: shown, matchId, status: "saving" });
    save(winner, loser, matchId);
    window.setTimeout(advance, 1100);
  };

  const undo = () => {
    if (pick !== null) return;
    if (last && last.status === "saved") {
      const target = last;
      setLast(null);
      setRanked((n) => Math.max(0, n - 1));
      setNote("Vote undone");
      rankBackend().undo(target.matchId).then((o) => { if (!o.ok) setNote(o.message); });
    }
    setI((n) => Math.max(0, n - 1));
  };

  const skip = () => {
    if (!pair || !ctx || pick !== null) return;
    rankBackend().skip(pair[0], pair[1], matchIdFor(ctx.date, pair[0].key, pair[1].key)).then((o) => { if (!o.ok && o.error !== "already") setNote(o.message); });
    setLast(null);
    setNote("Skipped. We'll ask about those another time");
    advance();
  };

  const tough = () => { if (pick !== null) return; setLast(null); setNote(null); advance(); };

  const winner = pick === null ? null : last?.winner ?? null;
  const where = ctx ? `${mealLabel(ctx.meal)} at ${hallShort(ctx.hallId)}` : " ";
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <div className="label">{where}</div>
        <div className="title-lg">Which was better?</div>
      </div>
      <Appear id={pair ? `${i}-${pair[0].key}` : "none"} className="duel">
        {(pair ?? [null, null]).map((d, k) => (
          <motion.button
            key={d?.key ?? k}
            type="button"
            className={`duel-opt ${pick === k ? "picked" : ""}`}
            onClick={() => choose(k as 0 | 1)}
            disabled={!d}
            animate={{ opacity: pick !== null && pick !== k ? 0.5 : 1 }}
            transition={tr}
          >
            <div style={{ position: "relative", width: "100%" }}>
              {d ? <DishThumb name={d.name} w="100%" h={160} r={18} /> : <div className="ph" style={{ width: "100%", height: 160, borderRadius: 18 }} />}
              {pick === k && (
                <motion.span className="pick-check" initial={reduce ? false : STATE_OUT} animate={{ ...STATE_IN, transitionEnd: { filter: "none" } }} transition={reduce ? { duration: 0 } : { opacity: STATE_FADE, filter: STATE_FADE }}>
                  <Icon icon={Tick02Icon} size={16} sw={2.6} />
                </motion.span>
              )}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2, minHeight: 36, display: "grid", alignItems: "center" }}>{d?.name ?? " "}</span>
            <span className="num label" style={{ fontSize: 12, marginTop: -6 }}>{d ? [d.calories !== undefined && `${d.calories} cal`, hallShort(d.hallId)].filter(Boolean).join(" · ") : " "}</span>
          </motion.button>
        ))}
        <motion.div className="or" aria-hidden animate={pick !== null ? STATE_OUT : STATE_IN} transition={STATE_FADE}>or</motion.div>
      </Appear>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
        <button type="button" className="textbtn" onClick={undo}><Icon icon={Undo02Icon} size={15} /> Undo</button>
        <button type="button" className="textbtn" onClick={tough}>Too tough</button>
        <button type="button" className="textbtn" onClick={skip}>Skip</button>
      </div>
      <div className="card" style={{ minHeight: 50, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 14, color: "var(--ink-2)" }}>
        {last && (last.status === "error" || last.status === "already") ? (
          <Swap id={"e" + last.matchId + last.status} style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", justifyContent: "space-between" }}>
            <span>{last.message}</span>
            {last.retry && <button type="button" className="textbtn" style={{ color: "var(--p9)" }} onClick={last.retry}>Retry</button>}
          </Swap>
        ) : winner && last ? (
          <Swap id={last.matchId} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="delta up"><Icon icon={ArrowUp01Icon} size={12} sw={2.4} />{last.delta}</span> {winner.name} moved up at {hallShort(winner.hallId)}
          </Swap>
        ) : (
          <Swap id={"prompt" + ranked + (note ?? "")}><span>{note ?? (ranked === 0 ? "Tap the one you liked more" : `${ranked} ranked today. Keep going?`)}</span></Swap>
        )}
      </div>
    </div>
  );
}

const BOARDS = ["Halls", "Colleges"] as const;
function Board({ catalog, state }: { catalog: CatalogDish[]; state: RankState | null }) {
  const [kind, setKind] = useState<(typeof BOARDS)[number]>("Halls");
  const [college, setCollege] = useState<College | undefined>(undefined);
  useEffect(() => { setCollege(readProfile().college); }, []);
  const dishes = useMemo(() => mergeDishes(catalog, state?.dishes ?? {}), [catalog, state]);
  const halls = useMemo(() => hallStandings(dishes, state?.opening ?? null), [dishes, state]);
  const colleges = useMemo(() => collegeStandings(state?.colleges ?? {}, dishes), [state, dishes]);
  const mine = college ? colleges.find((c) => c.college === college) : undefined;
  const lead = colleges[0];
  const headline = !state ? " "
    : mine ? <>{mine.college} is <span style={{ color: "var(--p9)" }}>#{mine.rank}</span> this week</>
    : lead && lead.votesCast > 0 ? <>{lead.college} leads this week</>
    : <>No votes yet this week</>;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card">
        <div className="label">{state ? `Week of ${shortDate(state.week)}` : " "}</div>
        <div className="title-lg" style={{ marginTop: 2 }}><Swap id={state ? `${mine?.college ?? lead?.college}-${mine?.rank ?? lead?.votesCast}` : "wait"}><span>{headline}</span></Swap></div>
      </div>
      <Seg options={BOARDS} value={kind} onChange={setKind} label="Leaderboard" />
      <Appear id={kind + (state ? "" : "-wait")} className="card" style={{ padding: "2px 14px" }}>
        {kind === "Halls"
          ? halls.map((h, n) => {
              const rated = dishes.filter((d) => d.hallId === h.hallId && d.votes > 0).length;
              return (
                <div className="row" key={h.hallId}>
                  <span className="num" style={{ width: 18, fontWeight: 700, color: n === 0 ? "var(--y11)" : "var(--ink-3)" }}>{n + 1}</span>
                  <span style={{ width: 8, height: 28, borderRadius: 9, background: hallColor(h.hallId) }} />
                  <div className="grow"><div className="title">{hallShort(h.hallId)}</div><div className="sub num">{h.score.toLocaleString()} pts · {rated === 1 ? "1 dish ranked" : `${rated} dishes ranked`}</div></div>
                  <Change standing={h} />
                </div>
              );
            })
          : colleges.map((c) => {
              const me = c.college === college;
              return (
                <div className="row" key={c.college} style={me ? { background: "var(--p3)", margin: "0 -10px", padding: "10px", borderRadius: 12, borderTop: 0 } : undefined}>
                  <span className="num" style={{ width: 18, fontWeight: 700, color: c.rank === 1 && c.votesCast > 0 ? "var(--y11)" : "var(--ink-3)" }}>{c.rank}</span>
                  <span style={{ width: 8, height: 28, borderRadius: 9, background: hallColor(c.hallId) }} />
                  <div className="grow"><div className="title">{c.college}</div><div className="sub num"><Swap id={String(c.votesCast)}>{c.votesCast === 1 ? "1 vote" : `${c.votesCast} votes`}</Swap> this week</div></div>
                </div>
              );
            })}
      </Appear>
      <Link href="/vote" className="btn btn-secondary btn-block"><Icon icon={QrCodeIcon} size={18} /> Open the live vote</Link>
    </div>
  );
}

function Change({ standing }: { standing: { change: number; openingRank?: number } }) {
  if (!standing.openingRank) return null; // no snapshot from last week yet: show no movement rather than a made-up one
  if (standing.change > 0) return <span className="delta up"><Icon icon={ArrowUp01Icon} size={12} sw={2.4} />{standing.change}</span>;
  if (standing.change < 0) return <span className="delta down"><Icon icon={ArrowDown01Icon} size={12} sw={2.4} />{-standing.change}</span>;
  return <span className="label" style={{ fontSize: 12 }}>same</span>;
}
