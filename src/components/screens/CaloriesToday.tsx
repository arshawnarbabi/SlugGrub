"use client";

// Owner: Arshawn. Today card 6 (PLAN.md): calories today, private. Reads the plates and the profile saved on this device only.
// 2026-11-15 (his ask: "shouldn't the calories today show like a ring of calories eaten vs calories left", and his pick of the
// optional goal step): with a goal, a ring of eaten vs the goal in the app's blue (the Budget ring's family: same 250-degree arc,
// --paper-2 track, --p9 fill, round caps), "N left" in the middle, or "Goal reached" past it, calm, never red and never "over"; the
// ring moves on THE spring when a plate was added (it starts where Today last left it, settle.ts). Protein eaten sits beside it.
// No goal: calories and protein eaten with no target, and a small "Set a goal" link to the goal step.
import Link from "next/link";
import { useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight01Icon, FireIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { CountUp, Swap, SPRING_CFG } from "@/components/ui/motion";
import { goalCalories, useProfile } from "@/lib/profile";
import { useCaloriesToday } from "./plates";
import { useSettle } from "./settle";

const SWEEP = 250, R = 39, C = 2 * Math.PI * R, ARC = C * (SWEEP / 360), SIZE = 92;

export function CaloriesToday() {
  const today = useCaloriesToday();
  const profile = useProfile();
  const goal = goalCalories(profile);
  const eaten = useSettle("calories", today ? today.calories : null);
  const protein = useSettle("protein", today ? today.proteinG : null) ?? 0;
  if (goal && eaten !== null) return <GoalRing eaten={eaten} goal={goal} protein={protein} plates={today?.plates ?? 0} />;

  const none = today !== null && today.plates === 0;
  // no goal: the card opens Log; "Set a goal" sits beside it as its own link (a link can't hold a link)
  return (
    <div className="card tight" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Link href="/log" className="press link" style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, color: "inherit", textDecoration: "none" }}>
        <span className="iconbtn" style={{ width: 44, height: 44, borderRadius: 12, background: "var(--paper-2)" }}><Icon icon={FireIcon} size={20} sw={2} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ fontSize: 14 }}>Calories today</b>
          <div className="label num" style={{ fontSize: 12 }}>
            {none ? "Log a plate to start · only you see this" : today === null ? " " : `${protein}g protein · private`}
          </div>
        </div>
        {today !== null && !none && eaten !== null && <span className="num" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.03em" }}><CountUp to={eaten} /></span>}
      </Link>
      {profile !== undefined && (
        <Link href={profile ? "/onboarding?step=4&goal=1" : "/onboarding"} className="textbtn" style={{ fontSize: 13, color: "var(--p9)", flex: "none" }}>Set a goal</Link>
      )}
    </div>
  );
}

function GoalRing({ eaten, goal, protein, plates }: { eaten: number; goal: number; protein: number; plates: number }) {
  const reduce = useReducedMotion();
  const share = Math.max(0, Math.min(1, eaten / goal));
  // starts at the value drawn first (pages open static), then follows on THE spring
  const fill = useSpring(share, SPRING_CFG);
  useEffect(() => { if (reduce) fill.jump(share); else fill.set(share); }, [share, reduce, fill]);
  const dash = useTransform(fill, (v) => `${ARC * Math.max(0, v)} ${C}`);
  const shows = useTransform(fill, (v) => (v > 0.004 ? 1 : 0)); // a round cap draws a dot at zero length: hide it
  const left = Math.max(0, goal - eaten);
  const reached = eaten >= goal;
  return (
    <Link href="/log" className="card tight press link" style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 32 }} aria-label={`Calories today: ${eaten} of ${goal}${reached ? ", goal reached" : `, ${left} left`}. Only you see this.`}>
      <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
      <div style={{ position: "relative", width: SIZE, height: SIZE, flex: "none" }} aria-hidden>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: `rotate(${90 + (360 - SWEEP) / 2}deg)` }}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--paper-2)" strokeWidth="8" strokeDasharray={`${ARC} ${C}`} strokeLinecap="round" />
          <motion.circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--p9)" strokeWidth="8" strokeLinecap="round" style={{ strokeDasharray: dash, strokeOpacity: shows }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1.1 }}>
          <Swap id={reached ? "reached" : "left"}>
            {reached
              ? <span style={{ fontSize: 12, fontWeight: 700, color: "var(--p9)" }}>Goal<br />reached</span>
              : <span><span className="num" style={{ display: "block", fontSize: 16, fontWeight: 700, letterSpacing: "-0.03em" }}><CountUp to={left} /></span><span className="label" style={{ fontSize: 11 }}>left</span></span>}
          </Swap>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 6 }}>
        <div>
          <b style={{ fontSize: 14 }}>Calories today</b>
          <div className="label num" style={{ fontSize: 12 }}><CountUp to={eaten} /> of {goal.toLocaleString("en-US")} eaten</div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: 9, background: "var(--protein)", alignSelf: "center" }} />
          <span className="label" style={{ fontSize: 12 }}>Protein</span>
          <span className="num" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>{protein}g</span>
        </div>
        <div className="label" style={{ fontSize: 11 }}>{plates === 0 ? "Log a plate to start · only you see this" : "Only you see this"}</div>
      </div>
    </Link>
  );
}
