"use client";

// Owner: Arshawn. Brand kit only: the interactive pieces that show the motion system.
// Motion rules (docs/DESIGN.md, motion): one shared spring, short press feedback, things slide instead of jumping,
// gooey only where pieces split from or merge into each other (the camera menu). prefers-reduced-motion turns
// springs into instant changes.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, animate, AnimatePresence } from "framer-motion";
import { Liquid } from "liquid-gooey";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  RiceBowl01Icon, Camera01Icon, Home09Icon, ChampionIcon, Restaurant01Icon, Wallet01Icon, Cancel01Icon, SparklesIcon,
  Undo02Icon, ArrowUp01Icon, Tick02Icon,
} from "@hugeicons/core-free-icons";

type IconDef = Parameters<typeof HugeiconsIcon>[0]["icon"];
function I({ icon, size = 18, sw = 1.8, color = "currentColor" }: { icon: IconDef; size?: number; sw?: number; color?: string }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={sw} color={color} />;
}

/** THE spring (his asks: "subtle spring ... consistently translated for each", then "make the overall consistent spring and goo
 *  effect subtler"). Damping ratio about 0.81, about 1.3% overshoot: it settles with a hint of life, no visible bounce.
 *  Used by every slide, settle and pop, by the gooey camera, and (as a CSS linear() curve, --spring in brand.css) by button release. */
export const SPRING_CFG = { stiffness: 300, damping: 28, mass: 1 };
export const SPRING = { type: "spring" as const, ...SPRING_CFG };
const SPRING_SOFT = SPRING;
/** THE goo: one setting for every liquid surface. Subtle bridge, short trail. */
export const GOO = { blur: 5, contrast: 18 };
// No trailing "move" spring anywhere: the liquid follows its element exactly, so THE spring is the only spring (consistency fix).

/** THE state change (his ask: "when states change i really want the default to be blur + fade in/out/morph"):
 *  outgoing blurs out, fades and shrinks a little; incoming blurs in from the same; scale rides THE spring. */
export const STATE_IN = { opacity: 1, filter: "blur(0px)", scale: 1 };
export const STATE_OUT = { opacity: 0, filter: "blur(4px)", scale: 0.92 };
const STATE_FADE = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

/** Swap: wrap anything whose content changes with state (an icon, a label, a message); it blur-fades and morphs between values. */
export function Swap({ id, children, rotate = 0, className, style }: { id: string; children: React.ReactNode; rotate?: number; className?: string; style?: React.CSSProperties }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={id}
        className={className}
        style={{ display: "inline-grid", ...style }}
        initial={reduce ? false : { ...STATE_OUT, rotate: -rotate }}
        animate={{ ...STATE_IN, rotate: 0, transitionEnd: { filter: "none" } }}
        exit={reduce ? { opacity: 0 } : { ...STATE_OUT, rotate }}
        transition={reduce ? { duration: 0 } : { opacity: STATE_FADE, filter: STATE_FADE, scale: SPRING, rotate: SPRING }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

/* ── gooey camera menu: the only gooey moment, so it reads as special ── */
export function CameraMenu() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : SPRING_CFG;
  return (
    <div className="cam-wrap">
      <Liquid style={{ position: "relative", width: 60, height: 60 }} filterPadding={96} {...GOO} fill="var(--p9)" shadow="0 1px 2px rgba(20,30,50,.12), 0 8px 18px -8px rgba(20,30,50,.32), inset 0 1px 0 rgba(255,255,255,.3)">
        <Liquid.Item x={open ? -58 : 0} y={open ? -46 : 0} transition={t} style={{ position: "absolute", left: 7, top: 7 }}>
          <button type="button" className={`drop ${open ? "on" : ""}`} aria-label="Ask SlugGrub" tabIndex={open ? 0 : -1}><I icon={SparklesIcon} size={20} sw={1.9} /></button>
        </Liquid.Item>
        <Liquid.Item x={0} y={open ? -76 : 0} transition={t} delay={reduce ? 0 : 45} style={{ position: "absolute", left: 7, top: 7 }}>
          <button type="button" className={`drop ${open ? "on" : ""}`} aria-label="Log a plate" tabIndex={open ? 0 : -1}><I icon={Camera01Icon} size={20} sw={1.9} /></button>
        </Liquid.Item>
        <Liquid.Item style={{ position: "absolute", left: 0, top: 0 }}>
          <button type="button" className="cam-main" aria-label={open ? "Close" : "Open camera menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Swap id={open ? "close" : "food"} rotate={90}>
              <I icon={open ? Cancel01Icon : RiceBowl01Icon} size={24} sw={1.9} />
            </Swap>
          </button>
        </Liquid.Item>
      </Liquid>
    </div>
  );
}


/* ── GooTrack: the shared "sliding selection" — one liquid thumb that travels on THE spring and stretches with THE goo.
   Used by the tab bar and every segmented control, so they move the same way. ── */
function GooTrack({ count, index, refs, fill, shadow, className }: { count: number; index: number; refs: React.RefObject<(HTMLElement | null)[]>; fill: string; shadow?: string; className?: string }) {
  const [box, setBox] = useState<{ x: number; w: number; h: number } | null>(null);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    // measure after the option buttons have mounted (they render after this track), and again on resize
    const measure = () => {
      const el = refs.current?.[index];
      if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", measure); };
  }, [index, count, refs]);
  if (!box) return null;
  return (
    <Liquid className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} {...GOO} fill={fill} shadow={shadow}>
      <Liquid.Item observe>
        <motion.div className="goo-thumb" initial={false} animate={{ x: box.x, width: box.w }} transition={reduce ? { duration: 0 } : SPRING} style={{ height: box.h, top: 0 }} />
      </Liquid.Item>
    </Liquid>
  );
}

/* ── tab bar: the active capsule is a GooTrack thumb ── */
const TABS = [
  { id: "today", label: "Today", icon: Home09Icon },
  { id: "rank", label: "Rank", icon: ChampionIcon },
  { id: "halls", label: "Halls", icon: Restaurant01Icon },
  { id: "budget", label: "Budget", icon: Wallet01Icon },
] as const;
export type TabId = (typeof TABS)[number]["id"];

export function MotionTabBar({ active }: { active: TabId }) {
  const [on, setOn] = useState<TabId>(active);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const index = TABS.findIndex((t) => t.id === on);
  return (
    <div className="tabbar">
      <div className="pillbar">
        <div className="track">
          <GooTrack count={TABS.length} index={index} refs={refs} fill="var(--paper-2)" />
          {TABS.map((t, i) => (
            <button key={t.id} ref={(el) => { refs.current[i] = el; }} type="button" className={`tab ${on === t.id ? "on" : ""}`} onClick={() => setOn(t.id)} aria-current={on === t.id ? "page" : undefined}>
              <span className="tab-ink"><I icon={t.icon} size={21} sw={on === t.id ? 2.1 : 1.7} />{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      <CameraMenu />
    </div>
  );
}

/* ── segmented control: the selected pill slides ── */
export function Seg({ options, initial, start }: { options: string[]; initial: string; start?: boolean }) {
  const [on, setOn] = useState(initial);
  const refs = useRef<(HTMLElement | null)[]>([]);
  return (
    <div className="seg seg-m" role="radiogroup" style={start ? { alignSelf: "start", justifySelf: "start" } : undefined}>
      <div className="track">
        <GooTrack count={options.length} index={options.indexOf(on)} refs={refs} fill="var(--card)" />
        {options.map((o, i) => (
          <button key={o} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" aria-checked={on === o} className={on === o ? "is-on" : ""} onClick={() => setOn(o)}>
            <span className="seg-ink">{o}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── GooSlider: drag the thumb; it travels on THE spring and stretches with THE goo (servings, amounts). ── */
export function GooSlider({ min = 0.5, max = 3, step = 0.5, initial = 1.5, unit = "servings" }: { min?: number; max?: number; step?: number; initial?: number; unit?: string }) {
  const [val, setVal] = useState(initial);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const pct = (val - min) / (max - min);
  const setFrom = (clientX: number) => {
    const r = track.current?.getBoundingClientRect();
    if (!r) return;
    const raw = min + Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * (max - min);
    setVal(Math.round(raw / step) * step);
  };
  return (
    <div className="goo-slider">
      <div className="gs-head"><span className="eyebrow">Servings</span><b className="num"><Swap id={String(val)}>{val.toFixed(1)}</Swap> {unit}</b></div>
      <div
        ref={track}
        className="gs-track"
        role="slider" tabIndex={0} aria-valuemin={min} aria-valuemax={max} aria-valuenow={val} aria-label="Servings"
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setFrom(e.clientX); }}
        onPointerMove={(e) => { if (e.buttons) setFrom(e.clientX); }}
        onKeyDown={(e) => { if (e.key === "ArrowRight") setVal((v) => Math.min(max, v + step)); if (e.key === "ArrowLeft") setVal((v) => Math.max(min, v - step)); }}
      >
        <motion.div className="gs-fill" initial={false} animate={{ width: `${pct * 100}%` }} transition={reduce ? { duration: 0 } : SPRING} />
        <Liquid style={{ position: "absolute", inset: "-14px 0", pointerEvents: "none" }} {...GOO} fill="var(--p9)" shadow="0 1px 2px rgba(20,30,50,.12), inset 0 1px 0 rgba(255,255,255,.3)">
          <Liquid.Item observe>
            <motion.div className="gs-thumb" initial={false} animate={{ left: `calc(${pct * 100}% - 13px)` }} transition={reduce ? { duration: 0 } : SPRING} />
          </Liquid.Item>
        </Liquid>
      </div>
    </div>
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
          <motion.span className="pick-check" initial={reduce ? false : STATE_OUT} animate={{ ...STATE_IN, transitionEnd: { filter: "none" } }} transition={reduce ? { duration: 0 } : { opacity: STATE_FADE, filter: STATE_FADE, scale: SPRING }}>
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
          <Swap id={winner.name} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="delta up"><I icon={ArrowUp01Icon} size={12} sw={2.4} />12</span> {winner.name} moved up to <b style={{ color: "var(--ink)" }}>#3</b>
          </Swap>
        ) : (
          <Swap id="prompt"><span>Tap the one you liked more</span></Swap>
        )}
      </div>
    </>
  );
}
