"use client";

// Owner: Arshawn. Onboarding illustrations (his ask 2026-11-14: "really nice and polished graphics and not crowd everything to the
// top of the screen"). Drawn from the design system, not stock art: card fills, the Sidestash raise and chip shadow, the primary
// blue for what the student picked, ink tokens for everything else. Each one answers its question visually and follows the choice:
//   plan:    three plan cards fanned out, the chosen plan in front with its points per quarter
//   points:  the Budget ring, filled to the points they enter
//   college: a campus map, north up, every college a pin where it really sits; theirs is the blue pin with its name
//   hall:    a raised card previewing their usual hall: a photo of its building, its name and its open status now
//   about you (goal, 1 of 2): a raised stat card (height, weight, age, sex) that fills in as they type, a bar filling with it
//   your goal (goal, 2 of 2): the points ring, filled to the daily goal as activity and lose / maintain / gain change
// (review 2026-11-14: the maps went for cards at S12/S13, then the college map came back, polished, at his "i liked the map more")
// Picking an option moves the art on THE spring (2026-11-15, below); text inside still blur-fades. Nothing moves when a step opens.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { RiceBowl01Icon, Location01Icon, BodyWeightIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Swap, SPRING, SPRING_CFG, STATE_IN, STATE_OUT, STATE_FADE } from "@/components/ui/motion";
import "./onboard-art.css";
import type { College, HallId, MealPlanId } from "@/lib/types";
import type { Sex } from "@/lib/calorieGoal";
import { HALLS, MEAL_PLANS, mealNow } from "@/lib/halls";
import { campusNow } from "./now";

const ART_H = 236;

function Frame({ children, h = ART_H }: { children: React.ReactNode; h?: number }) {
  return <div style={{ height: h, display: "grid", placeItems: "center", position: "relative" }}>{children}</div>;
}

// Every graphic follows its question's answer on THE spring (his ask 2026-11-15: "make all the onbaording graphics animated as you
// change the options ... make tehem shuffl and swtich ... dont just snap to the next collge but make it smooth"; DESIGN.md note of
// the same date). Things that MOVE ride SPRING; text inside them still blur-fades (Swap). Reduced motion: nothing moves, changes
// are instant. The art never animates while a step opens (initial={false} everywhere: pages open static).

// The plan deck: four cards, one per plan. Slot 0 is the front card; 1 and 2 fan out behind it; 3 waits hidden under the front.
const DECK = [
  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, z: 4 },
  { x: -18, y: 6, rotate: -9, scale: 1, opacity: 0.7, z: 3 },
  { x: 18, y: 10, rotate: 8, scale: 1, opacity: 0.7, z: 2 },
  { x: 0, y: 14, rotate: 0, scale: 0.92, opacity: 0, z: 1 },
] as const;

export function PlanArt({ plan }: { plan: MealPlanId }) {
  const reduce = useReducedMotion();
  const ids = MEAL_PLANS.map((p) => p.id);
  const at = Math.max(0, ids.indexOf(plan));
  // the picked card comes to the front; the one it replaces tilts back into the fan beside it, the rest shuffle one place along
  const slotOf = (id: MealPlanId) => (at - ids.indexOf(id) + ids.length) % ids.length;
  const tr = reduce ? { duration: 0 } : { ...SPRING, opacity: STATE_FADE };
  return (
    <Frame>
      <div style={{ position: "relative", width: 230, height: 150 }}>
        {MEAL_PLANS.map((p) => {
          const slot = slotOf(p.id), d = DECK[slot], front = slot === 0;
          return (
            <motion.div key={p.id} className="art-card oa-plan" aria-hidden={!front}
              // the card being picked jumps above the deck at once, so it passes over the others on its way to the front
              style={{ zIndex: d.z }}
              initial={false} animate={{ x: d.x, y: d.y, rotate: d.rotate, scale: d.scale, opacity: d.opacity }} transition={tr}>
              <motion.span className="oa-raise" initial={false} animate={{ opacity: front ? 1 : 0 }} transition={reduce ? { duration: 0 } : STATE_FADE} />
              <motion.div className="oa-face" initial={false}
                animate={front ? { ...STATE_IN, transitionEnd: { filter: "none" } } : STATE_OUT} transition={reduce ? { duration: 0 } : STATE_FADE}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="art-chip"><Icon icon={RiceBowl01Icon} size={14} sw={2} /> Meal plan</span>
                  <span style={{ width: 34, height: 22, borderRadius: 6, background: "linear-gradient(135deg, var(--y9), var(--y11))", opacity: 0.85 }} />
                </div>
                <div>
                  <div className="label" style={{ fontSize: 12 }}>{p.label} plan</div>
                  <div className="num" style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1 }}>{p.pointsPerQuarter.toLocaleString()}</div>
                  <div className="label" style={{ fontSize: 12 }}>Slug Points each quarter</div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </Frame>
  );
}

export function PointsArt({ points, total }: { points: number; total: number }) {
  const r = 78, c = 2 * Math.PI * r, SWEEP = 250, arc = c * (SWEEP / 360);
  const share = Math.max(0, Math.min(1, points / Math.max(1, total)));
  const reduce = useReducedMotion();
  // The ring follows the slider on THE spring (his "i like how the slugpoints ring changes as you change the slider"). A spring keeps
  // its speed when the target moves again mid-flight, so a drag reads as one continuous sweep; the 200ms tween it replaced restarted
  // from rest on every pointer move. It starts where the points are (pages open static).
  const fill = useSpring(share, SPRING_CFG);
  useEffect(() => { if (reduce) fill.jump(share); else fill.set(share); }, [share, reduce, fill]);
  const dash = useTransform(fill, (v) => `${arc * Math.max(0, v)} ${c}`);
  return (
    <Frame>
      <div style={{ position: "relative", width: 190, height: 190 }}>
        <svg width="190" height="190" viewBox="0 0 190 190" style={{ transform: `rotate(${90 + (360 - SWEEP) / 2}deg)` }} aria-hidden>
          <circle cx="95" cy="95" r={r} fill="none" stroke="var(--paper-2)" strokeWidth="14" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
          <motion.circle cx="95" cy="95" r={r} fill="none" stroke="var(--p9)" strokeWidth="14" strokeLinecap="round" style={{ strokeDasharray: dash }} />
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

/** "About you" (2026-11-15, the goal's first screen): a raised stat card that fills in as they type. Four tiles (height, weight, age,
 *  sex); each value blur-morphs in (Swap) from a dash, and the bar under them fills on THE spring as answers arrive (a quarter each). */
export function BodyArt({ ft, inch, lb, age, sex }: { ft: string; inch: string; lb: string; age: string; sex: Sex | null }) {
  const reduce = useReducedMotion();
  const sexText = sex === "male" ? "Male" : sex === "female" ? "Female" : sex === "unsaid" ? "Not said" : "";
  const tiles: [string, string][] = [
    ["Height", ft ? `${ft}\u2032${inch || "0"}\u2033` : ""], ["Weight", lb ? `${lb} lb` : ""], ["Age", age], ["Sex", sexText],
  ];
  const share = tiles.filter(([, v]) => v).length / tiles.length;
  const fill = useSpring(share, SPRING_CFG);
  useEffect(() => { if (reduce) fill.jump(share); else fill.set(share); }, [share, reduce, fill]);
  return (
    <Frame h={200}>
      <div className="art-card raised" style={{ width: 260, padding: 14, display: "grid", gap: 12 }} aria-hidden>
        <span className="art-chip" style={{ justifySelf: "start" }}><Icon icon={BodyWeightIcon} size={14} sw={2} /> Your stats</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {tiles.map(([k, v]) => (
            <div key={k} style={{ background: "var(--paper-2)", borderRadius: 14, padding: "8px 12px", display: "grid", gap: 2, minWidth: 0 }}>
              <span className="label" style={{ fontSize: 11 }}>{k}</span>
              <span className="num" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: v ? undefined : "var(--ink-3)", whiteSpace: "nowrap" }}>
                <Swap id={v || "none"}>{v || "\u2013"}</Swap>
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "var(--paper-2)", overflow: "hidden" }}>
          <motion.div style={{ height: "100%", background: "var(--p9)", borderRadius: 3, transformOrigin: "0 50%", scaleX: fill }} />
        </div>
      </div>
    </Frame>
  );
}

/** "Your goal" (the goal's second screen, 2026-11-15): the same ring as the points step, filled to the goal on a 0 to 4,000 scale and
 *  following every change (activity, lose / maintain / gain, a typed number) on THE spring; the goal in the middle blur-morphs. No
 *  goal yet: an empty ring and a dash. */
export function GoalArt({ goal }: { goal: number | null }) {
  const r = 72, size = 176, c = 2 * Math.PI * r, SWEEP = 250, arc = c * (SWEEP / 360);
  const share = goal ? Math.max(0.04, Math.min(1, goal / 4000)) : 0;
  const reduce = useReducedMotion();
  const fill = useSpring(share, SPRING_CFG);
  useEffect(() => { if (reduce) fill.jump(share); else fill.set(share); }, [share, reduce, fill]);
  const dash = useTransform(fill, (v) => `${arc * Math.max(0, v)} ${c}`);
  const shows = useTransform(fill, (v) => (v > 0.004 ? 1 : 0)); // a round cap draws a dot at zero length: hide it
  const text = goal ? goal.toLocaleString("en-US") : "\u2013";
  const m = size / 2;
  return (
    <Frame h={190}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: `rotate(${90 + (360 - SWEEP) / 2}deg)` }} aria-hidden>
          <circle cx={m} cy={m} r={r} fill="none" stroke="var(--paper-2)" strokeWidth="14" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
          <motion.circle cx={m} cy={m} r={r} fill="none" stroke="var(--p9)" strokeWidth="14" strokeLinecap="round" style={{ strokeDasharray: dash, strokeOpacity: shows }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div className="hero-num" style={{ fontSize: 36, color: goal ? undefined : "var(--ink-3)" }}><Swap id={text}>{text}</Swap></div>
            <div className="label" style={{ fontSize: 12 }}>cal a day</div>
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

/** Where the name tag sits for each side: a gap from the pin in px, then a shift by the tag's own size in %. Both are transforms,
 *  so a flip from one side to another slides on the spring instead of jumping (the old CSS classes swapped a calc() at once). */
const TAG_AT: Record<Side, { gap: [number, number]; self: [number, number] }> = {
  right: { gap: [TAG_GAP, 0], self: [0, -50] }, left: { gap: [-TAG_GAP, 0], self: [-100, -50] },
  above: { gap: [0, -TAG_GAP], self: [-50, -100] }, below: { gap: [0, TAG_GAP], self: [-50, 0] },
  "above-right": { gap: [CORNER_X, -CORNER_Y], self: [0, -100] }, "above-left": { gap: [-CORNER_X, -CORNER_Y], self: [-100, -100] },
  "below-right": { gap: [CORNER_X, CORNER_Y], self: [0, 0] }, "below-left": { gap: [-CORNER_X, CORNER_Y], self: [-100, 0] },
};

export function CollegeArt({ college }: { college: College }) {
  const reduce = useReducedMotion();
  const at = COLLEGE_AT[college] ?? [MAP_W / 2, MAP_H / 2];
  const side = tagSide(college);
  const tag = TAG_AT[side];
  const tr = reduce ? { duration: 0 } : SPRING;
  // the tag's width follows the new name on the spring too (measured from a hidden copy), so it never snaps wider or narrower
  const measure = useRef<HTMLSpanElement>(null);
  const [tagW, setTagW] = useState<number | null>(null);
  useLayoutEffect(() => { if (measure.current) setTagW(measure.current.offsetWidth); }, [college]);
  return (
    <Frame>
      <div className="art-card raised" style={{ width: "min(100%, 320px)", padding: 8 }}>
        <div className="art-map" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }} aria-hidden>
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {CONTOURS.map((d, k) => <path key={k} d={d} fill="none" stroke="var(--paper)" strokeWidth="1.5" />)}
            <text x={MAP_W - 14} y={20} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--ink-3)">N</text>
            <path d={`M${MAP_W - 14} 24 l-3 6 h6 z`} fill="var(--ink-3)" />
            {/* the grey pin under the pick fades out as the blue pin lands on it; the one it left fades back in */}
            {Object.entries(COLLEGE_AT).map(([k, [x, y]]) => (
              <motion.circle key={k} cx={x} cy={y} r="4" fill="var(--ink-3)" stroke="var(--card)" strokeWidth="2"
                initial={false} animate={{ opacity: k === college ? 0 : 1 }} transition={reduce ? { duration: 0 } : STATE_FADE} />
            ))}
          </svg>
          {/* the pick: one blue pin and its name tag that travel across the map to the new college on THE spring */}
          <motion.div className="art-pick" initial={false} animate={{ left: `${(at[0] / MAP_W) * 100}%`, top: `${(at[1] / MAP_H) * 100}%` }} transition={tr}>
            <span className="art-pin" />
            <motion.div className="oa-tag-at" initial={false} animate={{ x: tag.gap[0], y: tag.gap[1] }} transition={tr}>
              <motion.span className="art-chip oa-tag" initial={false}
                animate={{ x: `${tag.self[0]}%`, y: `${tag.self[1]}%`, ...(tagW ? { width: tagW } : {}) }} transition={tr}>
                <Icon icon={Location01Icon} size={13} sw={2} />
                <Swap id={college}>{college}</Swap>
              </motion.span>
            </motion.div>
          </motion.div>
          <span ref={measure} className="art-chip oa-measure"><Icon icon={Location01Icon} size={13} sw={2} />{college}</span>
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
  const reduce = useReducedMotion();
  // Switching halls deals a new card: the old one tilts away to the left and fades as the new one comes up from the fanned spot on
  // the right to the front, on THE spring. Everything is absolutely placed in a fixed box, so the question below never moves.
  return (
    <Frame>
      <div style={{ position: "relative", width: 240, height: 212 }}>
        <BackCards />
        <AnimatePresence initial={false}>
          <motion.div key={hall} className="art-card raised" style={{ position: "absolute", inset: 0, padding: 8, display: "grid", gridTemplateRows: "auto 1fr" }}
            initial={reduce ? { opacity: 0 } : { x: 18, y: 10, rotate: 8, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { x: -22, y: 8, rotate: -9, opacity: 0, transition: { ...SPRING, opacity: { duration: 0.14, ease: "easeOut" } } }}
            // opacity settles fast (120ms) so the two cards' text never reads on top of each other; the move itself is THE spring
            transition={reduce ? { duration: 0 } : { ...SPRING, opacity: { duration: 0.12, ease: "easeOut" } }}>
            <HallFace hall={hall} now={now} />
          </motion.div>
        </AnimatePresence>
      </div>
    </Frame>
  );
}

function HallFace({ hall, now }: { hall: HallId; now: { date: string; minutes: number } | null }) {
  const info = HALLS.find((h) => h.id === hall);
  const status = now ? mealNow(hall, now.date, now.minutes) : null;
  const statusText = status ? status.text[0].toUpperCase() + status.text.slice(1) : " ";
  return (
    <>
      <Photo src={`/halls/${hall}.jpg`} h={140} r={16} eager alt={info ? `${info.name} area` : ""} />
      <div style={{ padding: "0 8px", display: "grid", alignContent: "center", gap: 2, minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>{info?.short ?? ""}</div>
        <div className="label" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{ width: 7, height: 7, borderRadius: 9, flex: "none", background: status?.open ? "var(--ok)" : "var(--ink-3)" }} />
          <Swap id={statusText}>{statusText}</Swap>
        </div>
      </div>
    </>
  );
}
