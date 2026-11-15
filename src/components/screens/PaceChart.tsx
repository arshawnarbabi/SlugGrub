"use client";

// Owner: Arshawn. Budget's "points left over the quarter" chart (his ask 2026-11-14: "make this graph actualy have axis and mean
// something. its easy to visually skim which i want to keep but axis will explain better ... and also i feel like its too short").
// One measure (Slug Points left) on one axis over the quarter's dates:
// Lines are labeled on the chart (no legend row), no gridlines and no today line, not interactive (2026-11-14 revisions, his asks).
//   - you: from the plan total on day one to your points today (solid primary); SlugGrub only knows those two points, so it's a line
//   - your pace ahead: today's rate carried to the end of the quarter, or to zero if you run out (dashed primary)
//   - even pace: plan total to zero on the last day (dashed ink-3)
// Recessive grid and axis labels in ink tokens; each line carries its own label (never color alone).
import { QUARTER_START } from "@/lib/budgetCalc";

const W = 320, H = 176, L = 40, R = 10, T = 10, B = 24;
const PW = W - L - R, PH = H - T - B;
const DAY = 86_400_000;
const dateAt = (day: number) => new Date(Date.parse(`${QUARTER_START}T12:00:00Z`) + day * DAY);
const label = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const round = (n: number) => (n >= 1000 ? `${(Math.round(n / 100) / 10).toLocaleString()}k` : String(Math.round(n)));

export function PaceChart({ planTotal, pointsLeft, elapsedDays, totalDays, spentPerDay }: { planTotal: number; pointsLeft: number; elapsedDays: number; totalDays: number; spentPerDay: number }) {
  const x = (day: number) => L + PW * (day / totalDays);
  const y = (pts: number) => T + PH * (1 - Math.max(0, pts) / planTotal);
  const runOutDay = spentPerDay > 0 ? elapsedDays + pointsLeft / spentPerDay : Infinity;
  const endDay = Math.min(totalDays, runOutDay);
  const endPts = Math.max(0, pointsLeft - spentPerDay * (endDay - elapsedDays));
  const yours = (day: number) => (day <= elapsedDays ? planTotal - (planTotal - pointsLeft) * (day / Math.max(1, elapsedDays)) : Math.max(0, pointsLeft - spentPerDay * (day - elapsedDays)));
  const even = (day: number) => planTotal * (1 - day / totalDays);
  const ticks = [0, planTotal];
  const paceAt = elapsedDays + (endDay - elapsedDays) * 0.55; // where "Your pace" sits along its line
  const evenAt = totalDays * 0.66; // where "Even pace" sits along its line
  // labels wear a halo in the card color so a line never runs through them (his ask 2026-11-14: "make sure hte labels dont clip")
  const halo = { stroke: "var(--card)", strokeWidth: 4, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Slug Points left: ${pointsLeft} today, ${Math.round(even(elapsedDays))} at an even pace`} style={{ display: "block", pointerEvents: "none" }}>
        {ticks.map((t) => (
          <text key={t} x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)" className="num">{round(t)}</text>
        ))}
        {[0, elapsedDays, totalDays].map((d, k) => (
          <text key={k} x={x(d)} y={H - 6} textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"} fontSize="11" fill={k === 1 ? "var(--ink-2)" : "var(--ink-3)"} fontWeight={k === 1 ? 700 : 400}>{k === 1 ? "Today" : label(dateAt(k === 2 ? d - 1 : d))}</text>
        ))}
        <line x1={x(0)} y1={y(planTotal)} x2={x(totalDays)} y2={y(0)} stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="3 4" />
        <line x1={x(elapsedDays)} y1={y(pointsLeft)} x2={x(endDay)} y2={y(endPts)} stroke="var(--p9)" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" opacity="0.55" />
        <line x1={x(0)} y1={y(planTotal)} x2={x(elapsedDays)} y2={y(pointsLeft)} stroke="var(--p9)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={x(elapsedDays)} cy={y(pointsLeft)} r="5" fill="var(--p9)" stroke="var(--card)" strokeWidth="2" />
        {/* line labels on the lines themselves (his ask 2026-11-14), so the chart reads without a legend */}
        <text x={x(elapsedDays) - 8} y={y(pointsLeft) - 10} textAnchor="end" fontSize="11" fontWeight="700" fill="var(--ink)" {...halo}>You</text>
        <text x={x(paceAt)} y={y(yours(paceAt)) - 10} textAnchor="middle" fontSize="11" fill="var(--ink-2)" {...halo}>Your pace</text>
        <text x={x(evenAt)} y={y(even(evenAt)) + 18} textAnchor="middle" fontSize="11" fill="var(--ink-3)" {...halo}>Even pace</text>
      </svg>
    </div>
  );
}
