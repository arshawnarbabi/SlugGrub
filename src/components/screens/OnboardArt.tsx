"use client";

// Owner: Arshawn. Onboarding illustrations (his ask 2026-11-14: "really nice and polished graphics and not crowd everything to the
// top of the screen"). Drawn from the design system, not stock art: card fills, the Sidestash raise and chip shadow, the primary
// blue for what the student picked, ink tokens for everything else. Each one answers its question visually and follows the choice:
//   plan:    three plan cards fanned out, the chosen plan in front with its points per quarter
//   points:  the Budget ring, filled to the points they enter
//   college: a campus map with every college; theirs is the blue pin with its name
//   hall:    the same map with the five dining halls; their usual hall is the blue pin
// State changes blur-fade (DESIGN motion.state_change); nothing slides in when a step opens.
import { motion, useReducedMotion } from "framer-motion";
import { RiceBowl01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Swap } from "@/components/ui/motion";
import type { College, HallId, MealPlanId } from "@/lib/types";
import { HALLS, MEAL_PLANS } from "@/lib/halls";

const ART_H = 236;

/** Campus, roughly as it sits on the hill (north up), on a 100 x 100 grid. */
const COLLEGE_AT: Record<College, [number, number]> = {
  "College Nine": [43, 20], "John R. Lewis": [53, 24], Crown: [67, 18], Merrill: [74, 30],
  Stevenson: [82, 46], Cowell: [76, 58], Kresge: [33, 40], Porter: [22, 47],
  Oakes: [34, 66], "Rachel Carson": [22, 62],
};
const HALL_AT: Record<HallId, [number, number]> = { "40": [48, 22], "20": [71, 24], "05": [79, 52], "25": [27, 44], "30": [28, 64] };

function Frame({ children }: { children: React.ReactNode }) {
  return <div style={{ height: ART_H, display: "grid", placeItems: "center", position: "relative" }}>{children}</div>;
}

export function PlanArt({ plan }: { plan: MealPlanId }) {
  const order = MEAL_PLANS.map((p) => p.id);
  const front = MEAL_PLANS.find((p) => p.id === plan) ?? MEAL_PLANS[0];
  const back = order.filter((id) => id !== plan).slice(0, 2);
  return (
    <Frame>
      <div style={{ position: "relative", width: 230, height: 150 }}>
        {back.map((id, k) => (
          <div key={id} className="art-card" style={{ position: "absolute", inset: 0, transform: `rotate(${k === 0 ? -9 : 8}deg) translate(${k === 0 ? -18 : 18}px, ${k === 0 ? 6 : 10}px)`, opacity: 0.7 }} />
        ))}
        <div className="art-card raised" style={{ position: "absolute", inset: 0, padding: 18, display: "grid", alignContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="art-chip"><Icon icon={RiceBowl01Icon} size={14} sw={2} /> Meal plan</span>
            <span style={{ width: 34, height: 22, borderRadius: 6, background: "linear-gradient(135deg, var(--y9), var(--y11))", opacity: 0.85 }} />
          </div>
          <div>
            <div className="label" style={{ fontSize: 12 }}><Swap id={front.id}>{front.label} plan</Swap></div>
            <div className="num" style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              <Swap id={front.id}>{front.pointsPerQuarter.toLocaleString()}</Swap>
            </div>
            <div className="label" style={{ fontSize: 12 }}>Slug Points each quarter</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function PointsArt({ points, total }: { points: number; total: number }) {
  const r = 78, c = 2 * Math.PI * r, SWEEP = 250, arc = c * (SWEEP / 360);
  const share = Math.max(0, Math.min(1, points / Math.max(1, total)));
  const reduce = useReducedMotion();
  return (
    <Frame>
      <div style={{ position: "relative", width: 190, height: 190 }}>
        <svg width="190" height="190" viewBox="0 0 190 190" style={{ transform: `rotate(${90 + (360 - SWEEP) / 2}deg)` }} aria-hidden>
          <circle cx="95" cy="95" r={r} fill="none" stroke="var(--paper-2)" strokeWidth="14" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
          <motion.circle cx="95" cy="95" r={r} fill="none" stroke="var(--p9)" strokeWidth="14" strokeLinecap="round"
            initial={false} animate={{ strokeDasharray: `${arc * share} ${c}` }} transition={reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div className="hero-num" style={{ fontSize: 40 }}>{points.toLocaleString()}</div>
            <div className="label" style={{ fontSize: 12 }}>of {total.toLocaleString()} points</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Map({ pins, picked, label }: { pins: [string, [number, number]][]; picked: string; label: string }) {
  const at = pins.find(([k]) => k === picked)?.[1] ?? [50, 50];
  return (
    <Frame>
      <div className="art-map" aria-hidden>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* the hill: soft contour lines and the road loop, all in the page tone */}
          {[0, 1, 2, 3].map((k) => (
            <ellipse key={k} cx="52" cy="44" rx={44 - k * 9} ry={34 - k * 7} fill="none" stroke="var(--paper)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          ))}
          <path d="M50 96 C 30 86, 14 70, 16 52 S 32 14, 52 12 S 90 26, 88 50 S 70 86, 50 96" fill="none" stroke="var(--card)" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {pins.map(([k, [x, y]]) => (
          <span key={k} className={`art-pin ${k === picked ? "on" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
        <motion.span className="art-chip art-tag" initial={false} animate={{ left: `${at[0]}%`, top: `${at[1]}%` }} transition={{ duration: 0 }}>
          <Swap id={picked}><><Icon icon={Location01Icon} size={13} sw={2} /> {label}</></Swap>
        </motion.span>
      </div>
    </Frame>
  );
}

export function CollegeArt({ college }: { college: College }) {
  return <Map pins={Object.entries(COLLEGE_AT) as [string, [number, number]][]} picked={college} label={college} />;
}

export function HallArt({ hall }: { hall: HallId }) {
  const short = HALLS.find((h) => h.id === hall)?.short ?? "";
  return <Map pins={Object.entries(HALL_AT) as [string, [number, number]][]} picked={hall} label={short} />;
}
