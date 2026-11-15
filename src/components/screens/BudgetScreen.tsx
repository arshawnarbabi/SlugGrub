"use client";

// Owner: Arshawn (UI). Real pace math wired in by the budget code (PLAN.md, Budget tab): src/lib/budgetCalc.ts on the plan and
// points saved at onboarding (src/lib/profile.ts, on this device). With no profile it shows example numbers and says so.
import { useState } from "react";
import Link from "next/link";
import { Screen } from "@/components/ui/Screen";
import { CountUp, Seg, Appear } from "@/components/ui/motion";
import { useProfile, type SavedProfile } from "@/lib/profile";
import { computePace } from "@/lib/budgetCalc";
import { MEAL_PLANS } from "@/lib/halls";
import { PaceChart } from "./PaceChart";
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
  // ring: 250 degrees, opening at the bottom where the pace pill sits (his ask 2026-11-14: "put it in that disconnect at the bottom so
  // you might have to shorten the ring to fit it")
  const SWEEP = 250, r = 84, c = 2 * Math.PI * r, arc = c * (SWEEP / 360);
  const leftShare = Math.min(1, p.pointsLeft / p.planTotal);
  const [pillTone, pillText] = PACE[p.pace];
  // days left this week, today through Sunday
  const weekDays = Math.min(p.daysLeft, 7 - ((weekdayOf(p.today) + 6) % 7));
  // One line under the chart, from the same pace the chart draws (computePace: today's average a day carried forward), so the
  // sentence and the line's end always agree (his review 2026-11-14: "one line of bigger text that says at this pace you will run
  // out by so and so date ... but make it actually match the pace").
  const outlook = p.runOutDate
    ? <>At this pace you run out <b>{short(p.runOutDate)}</b></>
    : <>At this pace you finish with <b className="num">{(p.leftoverAtQuarterEnd ?? 0).toLocaleString()}</b> left</>;
  return (
    <Screen top={<div className="topbar">
        <h1 className="title-xl">Budget</h1>
        <span className="tint blue">{planLabel} plan</span>
      </div>}>
<div className="card" style={{ position: "relative", height: 226, display: "grid", placeItems: "center" }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute", top: 16, transform: `rotate(${90 + (360 - SWEEP) / 2}deg)` }} aria-hidden>
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--paper-2)" strokeWidth="12" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--p9)" strokeWidth="12" strokeDasharray={`${arc * leftShare} ${c}`} strokeLinecap="round" />
        </svg>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div className="label">{p.estimated ? "Points left, about" : "Points left"}</div>
          <div className="hero-num" style={{ fontSize: 46 }}><CountUp to={p.pointsLeft} /></div>
        </div>
        <span className={`pill ${pillTone}`} style={{ position: "absolute", top: 184, left: "50%", transform: "translateX(-50%)" }}><span className="dot" />{pillText}</span>
      </div>
      {(!mine || p.estimated) && (
        <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>
          {!mine ? "Example numbers. Set up your plan below to see your own." : p.estimated ? `Estimated from the ${p.enteredPoints.toLocaleString()} you entered ${short(p.enteredOn)}, at your pace so far.` : ""}
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
          <div className="label" style={{ marginBottom: 8 }}>Slug Points left this quarter</div>
          <PaceChart planTotal={p.planTotal} pointsLeft={p.pointsLeft} elapsedDays={p.elapsedDays} totalDays={p.totalDays} spentPerDay={p.spentPerDay} />
          {/* centered under the chart, 16px (spacing.scale.4) clear of the date labels (his review 2026-11-14, S06: "center the at this
              pace text and increase padding from it and the graph") */}
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)", marginTop: 16, textAlign: "center", textWrap: "balance" }}>{outlook}</div>
        </div>
        <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>SlugGrub can&apos;t see your card, so it doesn&apos;t split spending between dining halls, cafes and markets. The GET app lists every purchase.</p>
        <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>A dining hall meal costs the same at every hall. Cafes and markets take 10% off with Slug Points.</p>
      </Appear>
      {/* a full button at the bottom of the page, the Sidestash white like "Continue with Google" (his ask 2026-11-15: the inline
          link was "so small. make it follow the style of the other buttons ... and put it at the bottom of thsi page") */}
      <Link href={mine ? "/onboarding?step=1" : "/onboarding"} className="btn btn-secondary btn-block raised">{mine ? "Update points" : "Set up your plan"}</Link>
    </Screen>
  );
}
