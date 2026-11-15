"use client";

// Owner: Arshawn. Onboarding illustrations (his ask 2026-11-14: "really nice and polished graphics and not crowd everything to the
// top of the screen"). Drawn from the design system, not stock art: card fills, the Sidestash raise and chip shadow, the primary
// blue for what the student picked, ink tokens for everything else. Each one answers its question visually and follows the choice:
//   plan:    three plan cards fanned out, the chosen plan in front with its points per quarter
//   points:  the Budget ring, filled to the points they enter
//   college: a campus map, north up, every college a pin where it really sits; theirs is the blue pin with its name
//   hall:    a raised card previewing their usual hall: a photo of its building, its name and its open status now
// (review 2026-11-14: the maps went for cards at S12/S13, then the college map came back, polished, at his "i liked the map more")
// State changes blur-fade (DESIGN motion.state_change); nothing slides in when a step opens.
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RiceBowl01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Swap, STATE_IN, STATE_OUT, STATE_FADE } from "@/components/ui/motion";
import type { College, HallId, MealPlanId } from "@/lib/types";
import { HALLS, MEAL_PLANS, mealNow } from "@/lib/halls";
import { campusNow } from "./now";

const ART_H = 236;

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

/** The two faded cards behind a raised front card, as on the meal plan step. */
function BackCards() {
  return (
    <>
      {[0, 1].map((k) => (
        <div key={k} className="art-card" style={{ position: "absolute", inset: 0, transform: `rotate(${k === 0 ? -9 : 8}deg) translate(${k === 0 ? -18 : 18}px, ${k === 0 ? 6 : 10}px)`, opacity: 0.7 }} />
      ))}
    </>
  );
}

// ── College step: the campus map ──────────────────────────────────────────────────────────────────────────────────────────
// Brought back at his review 2026-11-14 (S12: "i think i liked the map more, just make it look better and not sloppy like
// before"). What was sloppy, and the fix: the old SVG stretched to its box (preserveAspectRatio="none", so the hill's contours
// were squashed ellipses), now the box has the map's own aspect ratio; the pins were guesses, now each college is placed from its
// real latitude and longitude (north up) and snapped to a 4px grid; the name tag could cover other pins or run off the edge, now
// it picks the first side (right, left, above, below, then the four corners) that stays inside the map and clear of every pin.
const MAP_W = 304, MAP_H = 192; // drawing units = CSS px at full size (the raised card adds 8px around: 320 x 208)
/** Each college's center, roughly (degrees). */
const COLLEGE_GEO: Record<College, [lat: number, lon: number]> = {
  "College Nine": [37.0017, -122.0575], "John R. Lewis": [37.0007, -122.0583], Crown: [37.0, -122.0545], Merrill: [36.9999, -122.0528],
  Cowell: [36.9969, -122.0537], Stevenson: [36.9971, -122.0519], Kresge: [36.9972, -122.0667], Porter: [36.9945, -122.0653],
  "Rachel Carson": [36.9912, -122.0645], Oakes: [36.9894, -122.0627],
};
const snap = (v: number) => Math.round(v / 4) * 4;
/** Projected into the map, north up, at about true proportions (east-west drawn 1.09x), centered. */
const COLLEGE_AT: Record<string, [number, number]> = (() => {
  const geo = Object.entries(COLLEGE_GEO);
  const lats = geo.map(([, [a]]) => a), lons = geo.map(([, [, o]]) => o);
  const [n, s, w, e] = [Math.max(...lats), Math.min(...lats), Math.min(...lons), Math.max(...lons)];
  return Object.fromEntries(geo.map(([k, [a, o]]) => [k, [snap(72 + ((o - w) / (e - w)) * 160), snap(28 + ((n - a) / (n - s)) * 152)]]));
})();

type Side = "right" | "left" | "above" | "below" | "above-right" | "above-left" | "below-right" | "below-left";
const SIDES: Side[] = ["right", "left", "above", "below", "above-right", "above-left", "below-right", "below-left"];
// chip height; pin center to the chip's near edge (clears the 14px halo); a corner tag sits 8px across and 14px up or down
const TAG_H = 26, TAG_GAP = 18, CORNER_X = 8, CORNER_Y = 14;
/** The tag's box for a side, in map units (width estimated from the name: 12px/600 text plus the chip's icon and padding). */
function tagBox(side: Side, [x, y]: [number, number], name: string) {
  const w = 38 + name.length * 7;
  if (side === "right") return { x0: x + TAG_GAP, y0: y - TAG_H / 2, w };
  if (side === "left") return { x0: x - TAG_GAP - w, y0: y - TAG_H / 2, w };
  if (side === "above") return { x0: x - w / 2, y0: y - TAG_GAP - TAG_H, w };
  if (side === "below") return { x0: x - w / 2, y0: y + TAG_GAP, w };
  return { x0: side.endsWith("right") ? x + CORNER_X : x - CORNER_X - w, y0: side.startsWith("above") ? y - CORNER_Y - TAG_H : y + CORNER_Y, w };
}
function tagSide(name: string): Side {
  const at = COLLEGE_AT[name];
  const fits = (side: Side) => {
    const { x0, y0, w } = tagBox(side, at, name);
    if (x0 < 6 || y0 < 6 || x0 + w > MAP_W - 6 || y0 + TAG_H > MAP_H - 6) return false;
    return Object.entries(COLLEGE_AT).every(([k, [px, py]]) => k === name || px < x0 - 7 || px > x0 + w + 7 || py < y0 - 7 || py > y0 + TAG_H + 7);
  };
  return SIDES.find(fits) ?? (at[0] > MAP_W / 2 ? "left" : "right");
}

/** The hill as soft contour lines, highest to the north (upper campus), drawn in the map's own units so nothing is stretched. */
const CONTOURS = [0, 1, 2, 3, 4].map((k) => {
  const cx = 168, cy = 36, rx = 46 + k * 40, ry = 30 + k * 30, pts: [number, number][] = [];
  for (let i = 0; i < 36; i++) {
    const t = (i / 36) * Math.PI * 2, wob = 1 + 0.045 * Math.sin(3 * t + k * 0.9) + 0.025 * Math.sin(5 * t + k * 1.7);
    pts.push([cx + Math.cos(t) * rx * wob, cy + Math.sin(t) * ry * wob]);
  }
  // closed Catmull-Rom curve through the points, as cubic Beziers
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length; i++) {
    const [p0, p1, p2, p3] = [-1, 0, 1, 2].map((o) => pts[(i + o + pts.length) % pts.length]);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
});

export function CollegeArt({ college }: { college: College }) {
  const reduce = useReducedMotion();
  const at = COLLEGE_AT[college] ?? [MAP_W / 2, MAP_H / 2];
  const side = tagSide(college);
  return (
    <Frame>
      <div className="art-card raised" style={{ width: "min(100%, 320px)", padding: 8 }}>
        <div className="art-map" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }} aria-hidden>
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {CONTOURS.map((d, k) => <path key={k} d={d} fill="none" stroke="var(--paper)" strokeWidth="1.5" />)}
            <text x={MAP_W - 14} y={20} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--ink-3)">N</text>
            <path d={`M${MAP_W - 14} 24 l-3 6 h6 z`} fill="var(--ink-3)" />
            {Object.entries(COLLEGE_AT).map(([k, [x, y]]) => <circle key={k} cx={x} cy={y} r="4" fill="var(--ink-3)" stroke="var(--card)" strokeWidth="2" />)}
          </svg>
          {/* the pick: blue pin and name tag, blurring out at the old college and in at the new one (nothing slides) */}
          <AnimatePresence initial={false}>
            <motion.div key={college} className="art-pick" style={{ left: `${(at[0] / MAP_W) * 100}%`, top: `${(at[1] / MAP_H) * 100}%` }}
              initial={reduce ? false : STATE_OUT} animate={{ ...STATE_IN, transitionEnd: { filter: "none" } }} exit={reduce ? { opacity: 0 } : STATE_OUT}
              transition={reduce ? { duration: 0 } : STATE_FADE}>
              <span className="art-pin" />
              <span className={`art-chip art-tag ${side}`}><Icon icon={Location01Icon} size={13} sw={2} />{college}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Frame>
  );
}

/** Their usual hall as it is right now: a photo of the hall's building (or, where Commons has none, one of its two colleges;
 *  public/halls/CREDITS.md), its name and its open status from today's real hours. The photo always shows, so a hall closed today
 *  (two close on weekends) still has a picture (his review 2026-11-14, S13). The clock is read after mount (never during render). */
export function HallArt({ hall }: { hall: HallId }) {
  const [now, setNow] = useState<{ date: string; minutes: number } | null>(null);
  useEffect(() => { setNow(campusNow(new Date())); }, []);
  const info = HALLS.find((h) => h.id === hall);
  const status = now ? mealNow(hall, now.date, now.minutes) : null;
  const statusText = status ? status.text[0].toUpperCase() + status.text.slice(1) : " ";
  return (
    <Frame>
      <div style={{ position: "relative", width: 240, height: 212 }}>
        <BackCards />
        <div className="art-card raised" style={{ position: "absolute", inset: 0, padding: 8, display: "grid", gridTemplateRows: "auto 1fr" }}>
          <Swap id={hall} style={{ display: "block" }}>
            <Photo src={`/halls/${hall}.jpg`} h={140} r={16} eager alt={info ? `${info.name} area` : ""} />
          </Swap>
          <div style={{ padding: "0 8px", display: "grid", alignContent: "center", gap: 2, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}><Swap id={hall}>{info?.short ?? ""}</Swap></div>
            <div className="label" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <span style={{ width: 7, height: 7, borderRadius: 9, flex: "none", background: status?.open ? "var(--ok)" : "var(--ink-3)" }} />
              <Swap id={hall + statusText}>{statusText}</Swap>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}
