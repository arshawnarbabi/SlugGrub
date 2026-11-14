"use client";

// Owner: Arshawn. Brand kit only: the interactive pieces that show the motion system.
// Motion rules (docs/DESIGN.md, motion): one shared spring, short press feedback, things slide instead of jumping,
// gooey only where pieces split from or merge into each other (the camera menu). prefers-reduced-motion turns
// springs into instant changes.

import { useEffect, useId, useRef, useState } from "react";
import { motion, LayoutGroup, useReducedMotion, animate } from "framer-motion";
import { Liquid } from "liquid-gooey";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Camera01Icon, Home09Icon, ChampionIcon, Restaurant01Icon, Wallet01Icon, Cancel01Icon, SparklesIcon,
  Undo02Icon, ArrowUp01Icon, Tick02Icon,
} from "@hugeicons/core-free-icons";

type IconDef = Parameters<typeof HugeiconsIcon>[0]["icon"];
function I({ icon, size = 18, sw = 1.8, color = "currentColor" }: { icon: IconDef; size?: number; sw?: number; color?: string }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={sw} color={color} />;
}

/** The one spring every sliding or settling thing uses. */
export const SPRING = { type: "spring" as const, stiffness: 420, damping: 36, mass: 0.9 };
const SPRING_SOFT = { type: "spring" as const, stiffness: 260, damping: 30 };

/* ── gooey camera menu: the only gooey moment, so it reads as special ── */
export function CameraMenu() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : "smooth";
  return (
    <div className="cam-wrap">
      <Liquid style={{ position: "relative", width: 60, height: 60 }} blur={7} contrast={20} fill="var(--p9)" shadow="0 1px 2px rgba(20,30,50,.10), 0 10px 26px -8px rgba(20,30,50,.30), inset 0 1px 0 rgba(255,255,255,.22)">
        <Liquid.Item x={open ? -58 : 0} y={open ? -46 : 0} transition={t} style={{ position: "absolute", left: 7, top: 7 }}>
          <button type="button" className="drop" aria-label="Ask SlugGrub" tabIndex={open ? 0 : -1}><I icon={SparklesIcon} size={20} sw={1.9} /></button>
        </Liquid.Item>
        <Liquid.Item x={0} y={open ? -76 : 0} transition={t} delay={reduce ? 0 : 45} style={{ position: "absolute", left: 7, top: 7 }}>
          <button type="button" className="drop" aria-label="Log a plate" tabIndex={open ? 0 : -1}><I icon={Camera01Icon} size={20} sw={1.9} /></button>
        </Liquid.Item>
        <Liquid.Item style={{ position: "absolute", left: 0, top: 0 }}>
          <button type="button" className="cam-main" aria-label={open ? "Close" : "Open camera menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <motion.span animate={{ rotate: open ? 90 : 0, scale: open ? 0.92 : 1 }} transition={reduce ? { duration: 0 } : SPRING} style={{ display: "grid" }}>
              <I icon={open ? Cancel01Icon : Camera01Icon} size={24} sw={1.9} />
            </motion.span>
          </button>
        </Liquid.Item>
      </Liquid>
    </div>
  );
}

/* ── tab bar: the active capsule slides between tabs ── */
const TABS = [
  { id: "today", label: "Today", icon: Home09Icon },
  { id: "rank", label: "Rank", icon: ChampionIcon },
  { id: "halls", label: "Halls", icon: Restaurant01Icon },
  { id: "budget", label: "Budget", icon: Wallet01Icon },
] as const;
export type TabId = (typeof TABS)[number]["id"];

export function MotionTabBar({ active }: { active: TabId }) {
  const [on, setOn] = useState<TabId>(active);
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <div className="tabbar">
      <LayoutGroup id={id}>
        <div className="pillbar">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={`tab ${on === t.id ? "on" : ""}`} onClick={() => setOn(t.id)} aria-current={on === t.id ? "page" : undefined}>
              {on === t.id && <motion.span layoutId="cap" className="tab-cap" transition={reduce ? { duration: 0 } : SPRING} />}
              <span className="tab-ink"><I icon={t.icon} size={21} sw={on === t.id ? 2.1 : 1.7} />{t.label}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>
      <CameraMenu />
    </div>
  );
}

/* ── segmented control: the selected pill slides ── */
export function Seg({ options, initial, start }: { options: string[]; initial: string; start?: boolean }) {
  const [on, setOn] = useState(initial);
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <LayoutGroup id={id}>
      <div className="seg seg-m" role="radiogroup" style={start ? { alignSelf: "start", justifySelf: "start" } : undefined}>
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={on === o} className={on === o ? "is-on" : ""} onClick={() => setOn(o)}>
            {on === o && <motion.span layoutId="pill" className="seg-pill" transition={reduce ? { duration: 0 } : SPRING} />}
            <span className="seg-ink">{o}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

/* ── numbers count up once when they first appear ── */
export function CountUp({ to, className, style }: { to: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) { el.textContent = to.toLocaleString("en-US"); return; }
    const c = animate(0, to, { duration: 0.9, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => { el.textContent = Math.round(v).toLocaleString("en-US"); } });
    return () => c.stop();
  }, [to, reduce]);
  return <span ref={ref} className={className} style={style}>{to.toLocaleString("en-US")}</span>;
}

/* ── this-or-that: tap a dish, it settles in, the other steps back, the change pops in ── */
type Choice = { src: string; name: string; meta: string };
export function Duel({ a, b }: { a: Choice; b: Choice }) {
  const [pick, setPick] = useState<"a" | "b" | null>(null);
  const reduce = useReducedMotion();
  const tr = reduce ? { duration: 0 } : SPRING_SOFT;
  const card = (key: "a" | "b", c: Choice) => (
    <motion.button
      type="button"
      className={`opt press ${pick === key ? "picked" : ""}`}
      onClick={() => setPick(key)}
      animate={{ scale: pick === null ? 1 : pick === key ? 1.02 : 0.96, opacity: pick && pick !== key ? 0.55 : 1 }}
      transition={tr}
      style={{ padding: 8, gap: 8 }}
    >
      <div className="ph" style={{ width: "100%", height: 150, borderRadius: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="photo" src={c.src} alt="" />
        {pick === key && (
          <motion.span className="pick-check" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={reduce ? { duration: 0 } : SPRING}>
            <I icon={Tick02Icon} size={16} sw={2.6} />
          </motion.span>
        )}
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{c.name}</span>
      <span className="num" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: -4, marginBottom: 6 }}>{c.meta}</span>
    </motion.button>
  );
  const winner = pick === "a" ? a : pick === "b" ? b : null;
  return (
    <>
      <div className="duel" style={{ marginTop: 8 }}>
        {card("a", a)}
        <motion.div className="or" style={{ top: "40%" }} animate={{ scale: pick ? 0.6 : 1, opacity: pick ? 0 : 1 }} transition={tr}>or</motion.div>
        {card("b", b)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 14, color: "var(--ink-2)", fontWeight: 500, padding: "0 6px" }}>
        <button type="button" className="textbtn" onClick={() => setPick(null)}><I icon={Undo02Icon} size={15} /> Undo</button>
        <button type="button" className="textbtn">Too tough</button>
        <button type="button" className="textbtn">Skip</button>
      </div>
      <div className="card" style={{ fontSize: 13, color: "var(--ink-2)", display: "flex", gap: 8, alignItems: "center", padding: 12, minHeight: 46 }}>
        {winner ? (
          <motion.div key={winner.name} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={reduce ? { duration: 0 } : SPRING} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="delta up"><I icon={ArrowUp01Icon} size={12} sw={2.4} />12</span> {winner.name} moved up to <b style={{ color: "var(--ink)" }}>#3</b>
          </motion.div>
        ) : (
          <span>Tap the one you liked more</span>
        )}
      </div>
    </>
  );
}
