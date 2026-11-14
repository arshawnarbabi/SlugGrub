"use client";

// Owner: Arshawn (UI). Karen wires Elo votes and real standings into it (PLAN.md, ranking and leaderboard).
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { QrCodeIcon, Tick02Icon, Undo02Icon, ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { Seg, Swap, Appear, SPRING, STATE_IN, STATE_OUT, STATE_FADE } from "@/components/ui/motion";
import { DISHES, DUELS, HALLS, USER } from "./demo";

const VIEWS = ["This or that", "Leaderboard"] as const;
type View = (typeof VIEWS)[number];

export function RankScreen() {
  const [view, setView] = useState<View>("This or that");
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
      {view === "This or that" ? <Appear id="duel"><Duels /></Appear> : <Appear id="board"><Board /></Appear>}
    </Screen>
  );
}

function Duels() {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<0 | 1 | null>(null);
  const reduce = useReducedMotion();
  const [a, b] = DUELS[i % DUELS.length].map((id) => DISHES[id]);
  const tr = reduce ? { duration: 0 } : SPRING;
  const choose = (k: 0 | 1) => {
    setPick(k);
    window.setTimeout(() => { setPick(null); setI((n) => n + 1); }, 1100);
  };
  const winner = pick === null ? null : pick === 0 ? a : b;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <div className="label">Lunch at {USER.hall}</div>
        <div className="title-lg">Which was better?</div>
      </div>
      <Appear id={i} className="duel">
        {[a, b].map((d, k) => (
          <motion.button
            key={d.id}
            type="button"
            className={`duel-opt ${pick === k ? "picked" : ""}`}
            onClick={() => pick === null && choose(k as 0 | 1)}
            animate={{ opacity: pick !== null && pick !== k ? 0.5 : 1 }}
            transition={tr}
          >
            <div className="ph" style={{ width: "100%", height: 160, borderRadius: 18 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.photo} alt="" />
              {pick === k && (
                <motion.span className="pick-check" initial={reduce ? false : STATE_OUT} animate={{ ...STATE_IN, transitionEnd: { filter: "none" } }} transition={reduce ? { duration: 0 } : { opacity: STATE_FADE, filter: STATE_FADE }}>
                  <Icon icon={Tick02Icon} size={16} sw={2.6} />
                </motion.span>
              )}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2, minHeight: 36, display: "grid", alignItems: "center" }}>{d.name}</span>
            <span className="num label" style={{ fontSize: 12, marginTop: -6 }}>{d.cal} cal · {d.hall}</span>
          </motion.button>
        ))}
        <motion.div className="or" animate={{ scale: pick !== null ? 0.6 : 1, opacity: pick !== null ? 0 : 1 }} transition={tr}>or</motion.div>
      </Appear>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
        <button type="button" className="textbtn" onClick={() => { setPick(null); setI((n) => Math.max(0, n - 1)); }}><Icon icon={Undo02Icon} size={15} /> Undo</button>
        <button type="button" className="textbtn" onClick={() => setI((n) => n + 1)}>Too tough</button>
        <button type="button" className="textbtn" onClick={() => setI((n) => n + 1)}>Skip</button>
      </div>
      <div className="card" style={{ minHeight: 50, display: "flex", alignItems: "center", fontSize: 14, color: "var(--ink-2)" }}>
        {winner ? (
          <Swap id={winner.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="delta up"><Icon icon={ArrowUp01Icon} size={12} sw={2.4} />12</span> {winner.name} moved up at {winner.hall}
          </Swap>
        ) : (
          <Swap id={"prompt" + i}><span>{i === 0 ? "Tap the one you liked more" : `${i} ranked today. Keep going?`}</span></Swap>
        )}
      </div>
    </div>
  );
}

const BOARDS = ["Halls", "Colleges"] as const;
function Board() {
  const [kind, setKind] = useState<(typeof BOARDS)[number]>("Halls");
  const rows = [...HALLS].sort((x, y) => y.score - x.score);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card">
        <div className="label">Week of Nov 10</div>
        <div className="title-lg" style={{ marginTop: 2 }}>{USER.college} is <span style={{ color: "var(--p9)" }}>#3</span> and climbing</div>
      </div>
      <Seg options={BOARDS} value={kind} onChange={setKind} label="Leaderboard" />
      <Appear id={kind} className="card" style={{ padding: "2px 14px" }}>
        {rows.map((h, n) => {
          const name = kind === "Halls" ? h.short : h.short.split("/")[0];
          const me = h.short.startsWith(USER.college);
          return (
            <div className="row" key={h.id} style={me ? { background: "var(--p3)", margin: "0 -10px", padding: "10px", borderRadius: 12, borderTop: 0 } : undefined}>
              <span className="num" style={{ width: 18, fontWeight: 700, color: n === 0 ? "var(--y11)" : "var(--ink-3)" }}>{n + 1}</span>
              <span style={{ width: 8, height: 28, borderRadius: 9, background: h.color }} />
              <div className="grow"><div className="title">{name}</div><div className="sub num">{h.score.toLocaleString()} pts</div></div>
              {h.change > 0 && <span className="delta up"><Icon icon={ArrowUp01Icon} size={12} sw={2.4} />{h.change}</span>}
              {h.change < 0 && <span className="delta down"><Icon icon={ArrowDown01Icon} size={12} sw={2.4} />{-h.change}</span>}
              {h.change === 0 && <span className="label" style={{ fontSize: 12 }}>same</span>}
            </div>
          );
        })}
      </Appear>
      <Link href="/vote" className="btn btn-secondary btn-block"><Icon icon={QrCodeIcon} size={18} /> Open the live vote</Link>
    </div>
  );
}
