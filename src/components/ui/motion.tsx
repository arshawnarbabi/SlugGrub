"use client";

// Owner: Arshawn. THE motion system (docs/DESIGN.md motion). Every moving thing uses these, nothing else.
//   spring: one subtle spring (300/28, ~1.3% overshoot)      goo: one subtle goo (blur 5, contrast 18), no trailing spring
//   state change: blur + fade + morph (4px, 92%)             blur is cheap (effects.blur_budget, a MUST)

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Liquid } from "liquid-gooey";

export const SPRING_CFG = { stiffness: 300, damping: 28, mass: 1 };
export const SPRING = { type: "spring" as const, ...SPRING_CFG };
export const GOO = { blur: 5, contrast: 18 };
// No trailing "move" spring anywhere: the liquid follows its element exactly, so THE spring is the only spring (consistency fix).
// THE state change (his asks 2026-11-14): a cheap smooth blur + fade out and in. No scale, no slide, nothing "coming in".
export const STATE_IN = { opacity: 1, filter: "blur(0px)" };
export const STATE_OUT = { opacity: 0, filter: "blur(4px)" };
export const STATE_FADE = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

/** Swap: anything whose content changes with state blur-fades and morphs into its new value. */
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
        transition={reduce ? { duration: 0 } : { opacity: STATE_FADE, filter: STATE_FADE, rotate: SPRING }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

/** Pages open static (his rule 2026-11-14: "dont animate the ui coming in on page selection, everything should be static").
 *  ScreenClock marks when a screen mounted; anything that would animate in within that first moment renders in place instead. */
const ScreenReady = createContext<boolean>(false);
export function ScreenClock({ children }: { children: React.ReactNode }) {
  // false while the screen opens, true a moment after it has mounted (no clock read during render)
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setReady(true), 400); return () => window.clearTimeout(t); }, []);
  return <ScreenReady.Provider value={ready}>{children}</ScreenReady.Provider>;
}
/** True once the screen has finished opening (400 ms after mount); for code that must not move anything while a page opens. */
export function useScreenReady() {
  return useContext(ScreenReady);
}

function useOpeningScreen() {
  const ready = useContext(ScreenReady);
  const [opening] = useState(() => !ready); // captured once, when this block mounts
  return opening;
}

/** Appear: a block whose content changes with what the student pressed (meal, hall, result, step). The old block blurs and fades
 *  out, the new one blurs and fades in: a light 2px blur (cheap on big blocks), opacity, nothing moves. Pass `id` so it knows when
 *  the content changed. Never animates while the page opens (pages open static). */
const BLOCK_OUT = { opacity: 0, filter: "blur(2px)" };
const BLOCK_IN = { opacity: 1, filter: "blur(0px)" };
export function Appear({ id = "static", children, className, style }: { id?: string | number; children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const reduce = useReducedMotion();
  const opening = useOpeningScreen();
  const fast = { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        className={className}
        style={style}
        initial={reduce || opening ? false : BLOCK_OUT}
        animate={{ ...BLOCK_IN, transitionEnd: { filter: "none" } }}
        exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { ...BLOCK_OUT, transition: { duration: 0.1, ease: "easeOut" } }}
        transition={reduce ? { duration: 0 } : fast}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Numbers: shown in place when a page opens (static, his rule); if the value changes later it blur-morphs like any state change. */
export function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const text = to.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <Swap id={text}>{text}</Swap>;
}

/** GooTrack: the one liquid thumb that slides under a row of options (tab bar, segmented controls). */
export function GooTrack({ index, refs, fill, deps = 0 }: { index: number; refs: React.RefObject<(HTMLElement | null)[]>; fill: string; deps?: number }) {
  const [box, setBox] = useState<{ x: number; w: number; h: number } | null>(null);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current?.[index];
      if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", measure); };
  }, [index, refs, deps]);
  if (!box || index < 0) return null;
  return (
    <Liquid style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} {...GOO} fill={fill}>
      <Liquid.Item observe>
        <motion.div className="goo-thumb" initial={false} animate={{ x: box.x, width: box.w }} transition={reduce ? { duration: 0 } : SPRING} style={{ height: box.h, top: 0 }} />
      </Liquid.Item>
    </Liquid>
  );
}

/** Segmented control on the goo thumb. */
export function Seg<T extends string>({ options, value, onChange, label, className, render }: { options: readonly T[]; value: T; onChange: (v: T) => void; label: string; className?: string; render?: (o: T) => React.ReactNode }) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  return (
    <div className={className ? `seg ${className}` : "seg"} role="radiogroup" aria-label={label}>
      <div className="track">
        <GooTrack index={options.indexOf(value)} refs={refs} fill="var(--card)" />
        {options.map((o, i) => (
          <button key={o} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" aria-checked={value === o} className={value === o ? "on" : ""} onClick={() => onChange(o)}>
            {render ? render(o) : o}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Slider with a gooey thumb (servings, amounts). */
export function GooSlider({ value, onChange, min = 0.5, max = 3, step = 0.5, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const pct = (value - min) / (max - min);
  const setFrom = (clientX: number) => {
    const r = track.current?.getBoundingClientRect();
    if (!r) return;
    const raw = min + Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * (max - min);
    onChange(Math.round(raw / step) * step);
  };
  return (
    <div
      ref={track}
      className="gs-track"
      role="slider" tabIndex={0} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-label={label}
      onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setFrom(e.clientX); }}
      onPointerMove={(e) => { if (e.buttons) setFrom(e.clientX); }}
      onKeyDown={(e) => { if (e.key === "ArrowRight") onChange(Math.min(max, value + step)); if (e.key === "ArrowLeft") onChange(Math.max(min, value - step)); }}
    >
      <motion.div className="gs-fill" initial={false} animate={{ width: `${pct * 100}%` }} transition={reduce ? { duration: 0 } : SPRING} />
      <Liquid style={{ position: "absolute", inset: "-14px 0", pointerEvents: "none" }} {...GOO} fill="var(--p9)" shadow="0 1px 2px rgba(20,30,50,.12), inset 0 1px 0 rgba(255,255,255,.3)">
        <Liquid.Item observe>
          <motion.div className="gs-thumb" initial={false} animate={{ left: `calc(${pct * 100}% - 13px)` }} transition={reduce ? { duration: 0 } : SPRING} />
        </Liquid.Item>
      </Liquid>
    </div>
  );
}
