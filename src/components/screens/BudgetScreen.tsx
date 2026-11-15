"use client";

// Owner: Arshawn (UI). Real pace math wired in by the budget code (PLAN.md, Budget tab): src/lib/budgetCalc.ts on the plan and
// points saved at onboarding (src/lib/profile.ts, on this device). With no profile it shows example numbers and says so.
import { useState } from "react";
import Link from "next/link";
import { Screen } from "@/components/ui/Screen";
import { CountUp, Seg, Appear } from "@/components/ui/motion";
import { useProfile, type SavedProfile } from "@/lib/profile";
import { computePace, weekOf } from "@/lib/budgetCalc";
import { MEAL_PLANS } from "@/lib/halls";
import { campusClock, weekdayOf } from "@/lib/campusTime";

const RANGES = ["This quarter", "This week"] as const;
const PACE = { "on-pace": ["ok", "On track"], fast: ["warn", "Spending fast"], slow: ["neutral", "Spending slow"] } as const;
const EXAMPLE = { plan: "gold" as const, pointsNow: 1120 };
const short = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function BudgetScreen() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("This quarter");
  const profile = useProfile();
  // The profile lives on the phone: until it is read (server render, first hydration pass) show only the title, so the numbers
  // render once, in place, with no swap from example to real (pages open static). This also keeps the clock out of server render.
  if (profile === undefined) return <Screen top={<div className="topbar"><h1 className="title-xl">Budget</h1></div>}>{null}</Screen>;
  return <BudgetBody profile={profile} range={range} setRange={setRange} />;
}

function BudgetBody({ profile, range, setRange }: { profile: SavedProfile | null; range: (typeof RANGES)[number]; setRange: (r: (typeof RANGES)[number]) => void }) {
  const mine = profile;
  const src = mine ?? EXAMPLE;
  const now = new Date();
  const enteredOn = mine ? campusClock(new Date(mine.savedAt)).date : undefined;
  const p = computePace(src.pointsNow, src.plan, now, enteredOn);
  const planLabel = MEAL_PLANS.find((x) => x.id === src.plan)?.label ?? "Gold";
  const r = 84, c = 2 * Math.PI * r, arc = c * 0.75;
  const leftShare = Math.min(1, p.pointsLeft / p.planTotal);
  const [pillTone, pillText] = PACE[p.pace];
  // days left this week, today through Sunday
  const weekDays = Math.min(p.daysLeft, 7 - ((weekdayOf(p.today) + 6) % 7));
  // chart: points used so far vs an even pace, start of quarter to today
  const x = 4 + 232 * (p.elapsedDays / p.totalDays);
  const y = 60 - 54 * Math.min(1, (p.planTotal - p.pointsLeft) / p.planTotal);
  const outlook = p.runOutDate
    ? `At this pace you run out the week of ${short(weekOf(p.runOutDate))}.`
    : `At this pace you finish the quarter with about ${(p.leftoverAtQuarterEnd ?? 0).toLocaleString()} points left.`;
  return (
    <Screen top={<div className="topbar">
        <h1 className="title-xl">Budget</h1>
        <span className="tint blue">{planLabel} plan</span>
      </div>}>
<div className="card" style={{ position: "relative", height: 226, display: "grid", placeItems: "center" }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute", top: 16, transform: "rotate(135deg)" }} aria-hidden>
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--paper-2)" strokeWidth="12" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--p9)" strokeWidth="12" strokeDasharray={`${arc * leftShare} ${c}`} strokeLinecap="round" />
        </svg>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div className="label">{p.estimated ? "Points left, about" : "Points left"}</div>
          <div className="hero-num" style={{ fontSize: 46 }}><CountUp to={p.pointsLeft} /></div>
          <span className={`pill ${pillTone}`} style={{ marginTop: 6 }}><span className="dot" />{pillText}</span>
        </div>
      </div>
      {(
        <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>
          {!mine ? "Example numbers. " : p.estimated ? `Estimated from the ${p.enteredPoints.toLocaleString()} you entered ${short(p.enteredOn)}, at your pace so far. ` : ""}
          <Link href="/onboarding" className="seeall" style={{ display: "inline" }}>{mine ? "Update points" : "Set up your plan"}</Link>
        </p>
      )}
      <Seg options={RANGES} value={range} onChange={setRange} label="Range" />
      <Appear id={range} style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {range === "This quarter" ? (
            <>
              <div className="card"><div className="label">Per day to last</div><div className="num" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>{Math.floor(p.perDayToFinish)}</div></div>
              <div className="card"><div className="label">Days left</div><div className="num" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>{p.daysLeft}</div></div>
            </>
          ) : (
            <>
              <div className="card"><div className="label">Your average a day</div><div className="num" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>{Math.round(p.spentPerDay)}</div></div>
              <div className="card"><div className="label">To spend this week</div><div className="num" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>{Math.floor(p.perDayToFinish * weekDays).toLocaleString()}</div></div>
            </>
          )}
        </div>
        <div className="card">
          <div className="label">Spending vs ideal pace</div>
          <svg viewBox="0 0 240 64" width="100%" height="64" aria-hidden style={{ marginTop: 8 }}>
            <line x1="4" y1="60" x2="236" y2="6" stroke="var(--ink-3)" strokeDasharray="3 4" strokeWidth="1.5" />
            <polyline points={`4,60 ${x.toFixed(1)},${y.toFixed(1)}`} fill="none" stroke="var(--p9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="4.5" fill="var(--p9)" />
          </svg>
          <div className="label" style={{ fontSize: 12, marginTop: 6 }}>{outlook} An even pace leaves you {p.idealLeft.toLocaleString()} today.</div>
        </div>
        <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>SlugGrub can&apos;t see your card, so it doesn&apos;t split spending between dining halls, cafes and markets. The GET app lists every purchase.</p>
        <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>A dining hall meal costs the same at every hall. Cafes and markets take 10% off with Slug Points.</p>
      </Appear>
    </Screen>
  );
}
