"use client";

// Owner: Arshawn. Launch splash (his idea 2026-11-14, after Trackify's heart burst: the rice bowl is a
// line icon, so it can't be a mask; it draws itself, then the splash fades off the app).
// Pure CSS keyframes (globals.css "Launch splash"), so it plays from the first paint, before React
// hydrates. Plays once per full page load; the root layout persists, so client navigation never replays it.
// No tile: the blue bowl draws over the app under one fixed 8px backdrop blur; then the icon blur-fades out while the blur
// layer fades off over the same 300ms (DESIGN effects.blur_budget: the radius never animates, only opacity).
import { useState } from "react";
import { RiceBowl01Icon } from "@hugeicons/core-free-icons";

type PathNode = [string, { d: string }];
const PATHS = (RiceBowl01Icon as unknown as PathNode[]).map(([, p]) => p.d);

export function Splash() {
  const [done, setDone] = useState(false);
  if (done) return null;
  return (
    <div className="splash" aria-hidden onAnimationEnd={(e) => { if (e.target === e.currentTarget) setDone(true); }}>
      <div className="splash-tile">
        <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
          {PATHS.map((d, i) => <path key={i} d={d} pathLength={1} className={`splash-p${i}`} />)}
        </svg>
      </div>
    </div>
  );
}
