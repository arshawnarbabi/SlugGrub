"use client";

// Owner: Arshawn (UI). Ethan wires the real pace math into it (PLAN.md, Budget tab).
import { useState } from "react";
import { Screen } from "@/components/ui/Screen";
import { CountUp, Seg, Appear } from "@/components/ui/motion";
import { USER } from "./demo";

const RANGES = ["This quarter", "This week"] as const;

export function BudgetScreen() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("This quarter");
  const r = 84, c = 2 * Math.PI * r, arc = c * 0.75;
  const used = 1 - USER.points / USER.pointsTotal;
  return (
    <Screen top={<div className="topbar">
        <h1 className="title-xl">Budget</h1>
        <span className="tint blue">{USER.plan} plan</span>
      </div>}>
<div className="card" style={{ position: "relative", height: 226, display: "grid", placeItems: "center" }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute", top: 16, transform: "rotate(135deg)" }} aria-hidden>
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--paper-2)" strokeWidth="12" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--p9)" strokeWidth="12" strokeDasharray={`${arc * (1 - used)} ${c}`} strokeLinecap="round" />
        </svg>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div className="label">Points left</div>
          <div className="hero-num" style={{ fontSize: 46 }}><CountUp to={USER.points} /></div>
          <span className="pill ok" style={{ marginTop: 6 }}><span className="dot" />On track</span>
        </div>
      </div>
      <Seg options={RANGES} value={range} onChange={setRange} label="Range" />
      <Appear id={range} style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="card"><div className="label">Per day</div><div className="num" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>{USER.perDay}</div></div>
          <div className="card"><div className="label">{range === "This quarter" ? "Days left" : "Left this week"}</div><div className="num" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>{range === "This quarter" ? USER.daysLeft : 287}</div></div>
        </div>
        <div className="card">
          <div className="label">Spending vs ideal pace</div>
          <svg viewBox="0 0 240 64" width="100%" height="64" aria-hidden style={{ marginTop: 8 }}>
            <line x1="4" y1="60" x2="236" y2="6" stroke="var(--ink-3)" strokeDasharray="3 4" strokeWidth="1.5" />
            <polyline points="4,60 40,53 76,44 112,37 148,31" fill="none" stroke="var(--p9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="148" cy="31" r="4.5" fill="var(--p9)" />
          </svg>
          <div className="label" style={{ fontSize: 12, marginTop: 6 }}>At this pace you finish the quarter with about 0 points left.</div>
        </div>
        <div className="card" style={{ padding: "2px 14px" }}>
          {[["Dining halls", 620], ["Cafes", 180], ["Markets", 85]].map(([n, v]) => (
            <div className="row" key={n}><div className="grow title">{n}</div><div className="num" style={{ fontWeight: 700 }}>{v}</div></div>
          ))}
        </div>
        <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>A dining hall meal costs the same at every hall. Cafes and markets take 10% off with Slug Points.</p>
      </Appear>
    </Screen>
  );
}
