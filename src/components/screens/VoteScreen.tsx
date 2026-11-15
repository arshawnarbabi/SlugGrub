"use client";

// Owner: Arshawn (UI). Karen's live QR vote: judges scan, vote once per phone per round, and every screen's bars move live
// (Firestore onSnapshot, or the local fallback's 2 s poll). VoteScreen is the phone; VoteProjector is /vote/screen for the projector.
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft01Icon, QrCodeIcon, Tv01Icon, ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { Swap, Appear, SPRING } from "@/components/ui/motion";
import { hallStandings, mergeDishes, type CatalogDish, type LiveRound, type LiveSide, type RankState } from "@/lib/rankCore";
import { rankBackend, readProfile, useRankState } from "@/lib/rankClient";
import { dishPhoto } from "./dishPhoto";
import { QrCode, hallColor, hallShort } from "./rankBits";

/** The address phones should open. NEXT_PUBLIC_SITE_URL wins (the deployed site); else this page's own origin. */
function useVoteUrl() {
  const [url, setUrl] = useState("");
  useEffect(() => { setUrl(`${(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "")}/vote`); }, []);
  const local = /\/\/(localhost|127\.0\.0\.1)/.test(url);
  return { url, local };
}

/** One live round: the tally, this device's ballot (optimistic until the store answers), and the vote action. */
function useRound(state: RankState | null) {
  const round = state?.round ?? null;
  const [pending, setPending] = useState<{ roundId: string; side: "a" | "b" } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const mine = round ? (state?.myBallot ?? (pending?.roundId === round.roundId ? pending.side : null)) : null;
  const counted = !!state?.myBallot;
  const a = (round?.aVotes ?? 0) + (pending && !counted && pending.roundId === round?.roundId && pending.side === "a" ? 1 : 0);
  const b = (round?.bVotes ?? 0) + (pending && !counted && pending.roundId === round?.roundId && pending.side === "b" ? 1 : 0);
  const vote = (side: "a" | "b") => {
    if (!round || mine) return;
    setPending({ roundId: round.roundId, side });
    setNote(null);
    rankBackend().ballot(round.roundId, side, readProfile().college).then((o) => {
      if (o.ok || o.error === "already") return;
      setPending(null);
      setNote(o.message);
    });
  };
  return { round, a, b, total: a + b, mine, vote, note };
}

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

function VoteBlock({ side, d, p, tall, mine, onVote, big }: { side: "a" | "b"; d: LiveSide; p: number; tall: boolean; mine: boolean; onVote: (s: "a" | "b") => void; big?: boolean }) {
  const reduce = useReducedMotion();
  const photo = dishPhoto(d.name);
  return (
    <button type="button" className="vote-blk press" style={{ minHeight: big ? undefined : tall ? 210 : 160, background: photo ? undefined : "var(--p9)" }} onClick={() => onVote(side)} aria-pressed={mine}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {photo && <img src={photo} alt="" />}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 8 }}>
          <div>
            <div style={{ fontSize: big ? "clamp(22px, 2.6vw, 40px)" : 20, fontWeight: 700, letterSpacing: "-0.03em" }}>{d.name}</div>
            <div style={{ fontSize: big ? "clamp(13px, 1.3vw, 20px)" : 12, opacity: 0.85 }}>{hallShort(d.hallId)}{mine ? " · your vote" : ""}</div>
          </div>
          <div className="num" style={{ fontSize: big ? "clamp(40px, 5vw, 88px)" : tall ? 40 : 32, fontWeight: 700, letterSpacing: "-0.04em" }}><Swap id={String(p)}>{p}%</Swap></div>
        </div>
        <div className="bar"><motion.i initial={false} animate={{ width: `${p}%` }} transition={reduce ? { duration: 0 } : SPRING} /></div>
      </div>
    </button>
  );
}

/* ── Phone: /vote ── */
export function VoteScreen({ catalog }: { catalog: CatalogDish[] }) {
  const { state, error } = useRankState(catalog);
  const { round, a, b, total, mine, vote, note } = useRound(state);
  const { url, local } = useVoteUrl();
  return (
    <Screen noTabBar top={<div className="topbar">
        <Link href="/rank" className="iconbtn" aria-label="Back"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
        <span className="tint gold"><span className="dot" style={{ background: "var(--bad)" }} /> Live · <Swap id={String(total)}>{total}</Swap> {total === 1 ? "vote" : "votes"}</span>
        <Link href="/vote/screen" className="iconbtn" aria-label="Projector view"><Icon icon={Tv01Icon} size={18} /></Link>
      </div>}>
<h1 className="title-xl">Dish of the week</h1>
      <p className="body" style={{ marginTop: -6 }}>{mine ? "Vote counted. Watch the bars move." : "Tap the one you'd rather eat. One vote per phone."}</p>
      <Appear id={round?.roundId ?? (state ? "none" : "wait")} style={{ display: "grid", gap: 14 }}>
        {round ? (
          <>
            <VoteBlock side="a" d={round.a} p={pct(a, total)} tall mine={mine === "a"} onVote={vote} />
            <VoteBlock side="b" d={round.b} p={total ? 100 - pct(a, total) : 0} tall={false} mine={mine === "b"} onVote={vote} />
          </>
        ) : (
          <div className="card" style={{ minHeight: 160, display: "grid", placeItems: "center", textAlign: "center", color: "var(--ink-2)" }}>
            {state ? "No round is live yet. The projector view starts one." : " "}
          </div>
        )}
      </Appear>
      {(note || error) && <div className="label" style={{ fontSize: 12, textAlign: "center" }}>{note ?? error}</div>}
      <div className="card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
        {url ? <QrCode value={url} size={64} /> : <span className="ph" style={{ width: 64, height: 64, borderRadius: 8 }} />}
        <div>
          <b>Scan to vote</b>
          <div className="label" style={{ fontSize: 12 }}>{local ? "Open this page from the network address so phones can reach it." : "Point your camera at the code. No app to install."}</div>
        </div>
      </div>
    </Screen>
  );
}

/* ── Projector: /vote/screen ── */
// Rounds pair two well-ranked dishes that have photos, from different halls when possible.
function pickPair(catalog: CatalogDish[], state: RankState | null, current: LiveRound | null): [CatalogDish, CatalogDish] | null {
  const ranked = mergeDishes(catalog, state?.dishes ?? {});
  const byKey = new Map(catalog.map((c) => [c.key, c]));
  const names = new Set<string>();
  const pool = ranked
    .map((d) => byKey.get(`${d.hallId}_${d.recipeId}`))
    .filter((c): c is CatalogDish => !!c && !!dishPhoto(c.name) && !names.has(c.name) && !!names.add(c.name)) // one per dish name
    .slice(0, 12);
  if (pool.length < 2) return null;
  const used = new Set(current ? [current.a.name, current.b.name] : []);
  const fresh = pool.filter((c) => !used.has(c.name));
  const list = fresh.length >= 2 ? fresh : pool;
  const first = list[Math.floor(Math.random() * Math.min(list.length, 6))];
  const rest = list.filter((c) => c.name !== first.name);
  const second = rest.find((c) => c.hallId !== first.hallId) ?? rest[0];
  return [first, second];
}

export function VoteProjector({ catalog }: { catalog: CatalogDish[] }) {
  const { state, error } = useRankState(catalog);
  const { round, a, b, total, mine, vote } = useRound(state);
  const { url, local } = useVoteUrl();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const started = useRef(false);
  const board = useMemo(() => hallStandings(mergeDishes(catalog, state?.dishes ?? {}), state?.opening ?? null), [catalog, state]);

  const next = async () => {
    const pair = pickPair(catalog, state, round);
    if (!pair) { setNote("Not enough dishes with photos on today's menus"); return; }
    setBusy(true);
    const o = await rankBackend().startRound(pair[0], pair[1]);
    setBusy(false);
    setNote(o.ok ? null : o.message);
  };
  // the first time the projector opens with no round, it starts one
  useEffect(() => {
    if (state && !state.round && !started.current) { started.current = true; next(); }
  });

  return (
    <div className="projector">
      <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Link href="/vote" className="iconbtn" aria-label="Back"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
          <span className="tint gold"><span className="dot" style={{ background: "var(--bad)" }} /> Live · <Swap id={String(total)}>{total}</Swap> {total === 1 ? "vote" : "votes"}</span>
        </div>
        <h1 className="title-xl" style={{ fontSize: "clamp(32px, 4vw, 64px)" }}>Dish of the week</h1>
        <Appear id={round?.roundId ?? "none"} style={{ display: "grid", gap: 16 }}>
          {round ? (
            <>
              <VoteBlock big side="a" d={round.a} p={pct(a, total)} tall mine={mine === "a"} onVote={vote} />
              <VoteBlock big side="b" d={round.b} p={total ? 100 - pct(a, total) : 0} tall mine={mine === "b"} onVote={vote} />
            </>
          ) : (
            <div className="card" style={{ minHeight: 200, display: "grid", placeItems: "center", color: "var(--ink-2)" }}>{state ? "Starting a round" : " "}</div>
          )}
        </Appear>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="button" className="btn btn-secondary" onClick={next} disabled={busy}>Next round</button>
          {(note || error) && <span className="label">{note ?? error}</span>}
        </div>
      </div>
      <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
        <div className="card" style={{ display: "grid", gap: 12, justifyItems: "center", textAlign: "center", padding: 24 }}>
          {url ? <QrCode value={url} size="min(100%, 46vh)" /> : <span className="ph" style={{ width: "min(100%, 46vh)", aspectRatio: "1", borderRadius: 8 }} />}
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "clamp(20px, 2vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em" }}><Icon icon={QrCodeIcon} size={22} /> Scan to vote</div>
          <div className="label num" style={{ fontSize: "clamp(13px, 1.2vw, 18px)" }}>{local ? "Phones can't open localhost: open this page from the network address" : url.replace(/^https?:\/\//, "")}</div>
        </div>
        <div className="card" style={{ padding: "2px 18px" }}>
          {board.map((h, n) => (
            <div className="row" key={h.hallId}>
              <span className="num" style={{ width: 22, fontWeight: 700, fontSize: 18, color: n === 0 ? "var(--y11)" : "var(--ink-3)" }}>{n + 1}</span>
              <span style={{ width: 8, height: 32, borderRadius: 9, background: hallColor(h.hallId) }} />
              <div className="grow"><div className="title" style={{ fontSize: "clamp(15px, 1.4vw, 22px)" }}>{hallShort(h.hallId)}</div></div>
              <span className="num" style={{ fontWeight: 700, fontSize: "clamp(15px, 1.4vw, 22px)" }}><Swap id={String(h.score)}>{h.score.toLocaleString()}</Swap></span>
              {h.openingRank && h.change > 0 && <span className="delta up"><Icon icon={ArrowUp01Icon} size={12} sw={2.4} />{h.change}</span>}
              {h.openingRank && h.change < 0 && <span className="delta down"><Icon icon={ArrowDown01Icon} size={12} sw={2.4} />{-h.change}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
