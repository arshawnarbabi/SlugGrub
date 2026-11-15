"use client";

// Owner: Arshawn. The thinking orb on Ask SlugGrub's action line (his ask 2026-11-15: "clone that action line and thinking orbs").
// Technique ported from his own Chalk app, which uses a dotted orb (dots placed on a sphere, projected, shaded by depth). Rebuilt
// here without a canvas: about 30 dots sit on five latitude rings of a globe seen from a little above. As the globe turns, a dot only
// slides along its ring (x = r cos(lat) sin(lon), the ring an ellipse from the tilt) while its depth sets its size and opacity, so
// every frame is transform and opacity on the compositor (Web Animations), with no filter, no layout and no main-thread loop.
// Each step shows its own motion (Chalk gives every action its own orb): the rings change speed or direction in place, never jump.
// Reduced motion: a still frame of the same globe.
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export type OrbMode = "reading" | "searching" | "solving" | "composing" | "working";

const RINGS = [
  { lat: -58, n: 4 },
  { lat: -29, n: 7 },
  { lat: 0, n: 8 },
  { lat: 29, n: 7 },
  { lat: 58, n: 4 },
];
// Turns per base period for each ring, per step (# draft): reading slow and even, searching steady, solving bands turning against
// each other (Chalk's "solving": bands scramble), composing a sash that undulates (the middle fastest), working quick.
const RATES: Record<OrbMode, number[]> = {
  reading: [0.55, 0.55, 0.55, 0.55, 0.55],
  searching: [1, 1, 1, 1, 1],
  solving: [1.35, -1.35, 1.35, -1.35, 1.35],
  composing: [0.7, 1.1, 1.5, 1.1, 0.7],
  working: [1.8, 1.8, 1.8, 1.8, 1.8],
};
const PERIOD_MS = 2600; // one turn of the globe at rate 1
const SAMPLES = 24; // keyframes per turn (linear between them)
const TILT = (24 * Math.PI) / 180; // seen from a little above, so each ring is an ellipse

function frame(size: number, latDeg: number, lon: number) {
  const r = size * 0.4;
  const lat = (latDeg * Math.PI) / 180;
  const x = r * Math.cos(lat) * Math.sin(lon);
  const y0 = -r * Math.sin(lat);
  const z0 = r * Math.cos(lat) * Math.cos(lon);
  const y = y0 * Math.cos(TILT) + z0 * Math.sin(TILT) * 0.9;
  const depth = (z0 * Math.cos(TILT) - y0 * Math.sin(TILT)) / r; // -1 back, 1 front
  const near = (depth + 1) / 2;
  return {
    transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${(0.5 + 0.5 * near).toFixed(3)})`,
    opacity: Number((0.18 + 0.82 * near ** 1.4).toFixed(3)),
  };
}

export function ThinkingOrb({ mode = "solving", size = 20, label }: { mode?: OrbMode; size?: number; label?: string }) {
  const box = useRef<HTMLSpanElement>(null);
  const anims = useRef<Animation[][]>([]);
  const reduce = useReducedMotion();
  const dot = Math.max(1.6, size * 0.11);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const dots = Array.from(el.children) as HTMLElement[];
    let k = 0;
    const made: Animation[][] = [];
    RINGS.forEach((ring, ri) => {
      made[ri] = [];
      for (let i = 0; i < ring.n; i++) {
        const d = dots[k++];
        const start = i / ring.n + (ri % 2) * 0.5 / ring.n; // rings offset half a step, so dots do not line up in columns
        if (reduce || typeof d.animate !== "function") {
          const f = frame(size, ring.lat, start * 2 * Math.PI);
          d.style.transform = f.transform;
          d.style.opacity = String(f.opacity);
          continue;
        }
        const kf = Array.from({ length: SAMPLES + 1 }, (_, s) => frame(size, ring.lat, (s / SAMPLES) * 2 * Math.PI));
        const a = d.animate(kf, { duration: PERIOD_MS, iterations: Infinity, iterationStart: start, easing: "linear" });
        // start deep into the loop: a ring turning backwards (negative rate) from time 0 would finish at once and drop to the center
        a.currentTime = PERIOD_MS * 2000;
        made[ri].push(a);
      }
    });
    anims.current = made;
    return () => {
      for (const ring of made) for (const a of ring) a.cancel();
      anims.current = [];
    };
  }, [size, reduce]);

  // a new step changes each ring's speed in place (no restart, no jump)
  useEffect(() => {
    anims.current.forEach((ring, ri) => {
      for (const a of ring) {
        const rate = RATES[mode][ri];
        if (typeof a.updatePlaybackRate === "function") a.updatePlaybackRate(rate);
        else a.playbackRate = rate;
      }
    });
  }, [mode, reduce, size]);

  const count = RINGS.reduce((n, r) => n + r.n, 0);
  return (
    <span ref={box} className="orb" role="img" aria-label={label ?? "Thinking"} style={{ width: size, height: size, ["--dot" as string]: `${dot}px` }}>
      {Array.from({ length: count }, (_, i) => <span key={i} />)}
    </span>
  );
}
