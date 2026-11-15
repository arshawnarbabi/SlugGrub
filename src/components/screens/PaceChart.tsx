"use client";

// Owner: Arshawn. Budget's "points left over the quarter" chart (his ask 2026-11-14: "make this graph actualy have axis and mean
// something. its easy to visually skim which i want to keep but axis will explain better ... and also i feel like its too short").
// One measure (Slug Points left) on one axis over the quarter's dates:
// Lines are labeled on the chart (no legend row); a touch or hover shows that day's values inside the plot. (2026-11-14 revision)
//   - you: from the plan total on day one to your points today (solid primary); SlugGrub only knows those two points, so it's a line
//   - your pace ahead: today's rate carried to the end of the quarter, or to zero if you run out (dashed primary)
//   - even pace: plan total to zero on the last day (dashed ink-3)
// Recessive grid and axis labels in ink tokens; each line carries its own label (never color alone).
import { useRef, useState } from "react";
import { QUARTER_START } from "@/lib/budgetCalc";

const W = 320, H = 176, L = 40, R = 10, T = 10, B = 24;
const PW = W - L - R, PH = H - T - B;
const DAY = 86_400_000;
const dateAt = (day: number) => new Date(Date.parse(`${QUARTER_START}T12:00:00Z`) + day * DAY);
const label = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const round = (n: number) => (n >= 1000 ? `${(Math.round(n / 100) / 10).toLocaleString()}k` : String(Math.round(n)));

export function PaceChart({ planTotal, pointsLeft, elapsedDays, totalDays, spentPerDay }: { planTotal: number; pointsLeft: number; elapsedDays: number; totalDays: number; spentPerDay: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const x = (day: number) => L + PW * (day / totalDays);
  const y = (pts: number) => T + PH * (1 - Math.max(0, pts) / planTotal);
  const runOutDay = spentPerDay > 0 ? elapsedDays + pointsLeft / spentPerDay : Infinity;
  const endDay = Math.min(totalDays, runOutDay);
  const endPts = Math.max(0, pointsLeft - spentPerDay * (endDay - elapsedDays));
  const yours = (day: number) => (day <= elapsedDays ? planTotal - (planTotal - pointsLeft) * (day / Math.max(1, elapsedDays)) : Math.max(0, pointsLeft - spentPerDay * (day - elapsedDays)));
  const even = (day: number) => planTotal * (1 - day / totalDays);
  const step = planTotal > 1600 ? 500 : planTotal > 400 ? 250 : 50; // round-number gridlines up to the plan total
  const ticks = Array.from({ length: Math.floor(planTotal / step) + 1 }, (_, k) => k * step);
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((e.clientX - box.left) / box.width) * W;
    setHover(Math.round(Math.min(totalDays, Math.max(0, ((px - L) / PW) * totalDays))));
  };
  const h = hover ?? elapsedDays;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Slug Points left: ${pointsLeft} today, ${Math.round(even(elapsedDays))} at an even pace`}
        onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} style={{ display: "block", touchAction: "pan-y" }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--paper-2)" strokeWidth="1" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)" className="num">{round(t)}</text>
          </g>
        ))}
        {[0, elapsedDays, totalDays].map((d, k) => (
          <text key={k} x={x(d)} y={H - 6} textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"} fontSize="11" fill={k === 1 ? "var(--ink-2)" : "var(--ink-3)"} fontWeight={k === 1 ? 700 : 400}>{k === 1 ? "Today" : label(dateAt(k === 2 ? d - 1 : d))}</text>
        ))}
        <line x1={x(elapsedDays)} x2={x(elapsedDays)} y1={T} y2={T + PH} stroke="var(--paper-2)" strokeWidth="1.5" />
        <line x1={x(0)} y1={y(planTotal)} x2={x(totalDays)} y2={y(0)} stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="3 4" />
        <line x1={x(elapsedDays)} y1={y(pointsLeft)} x2={x(endDay)} y2={y(endPts)} stroke="var(--p9)" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" opacity="0.55" />
        <line x1={x(0)} y1={y(planTotal)} x2={x(elapsedDays)} y2={y(pointsLeft)} stroke="var(--p9)" strokeWidth="2.5" strokeLinecap="round" />
        {hover !== null && hover !== elapsedDays && <line x1={x(h)} x2={x(h)} y1={T} y2={T + PH} stroke="var(--ink-3)" strokeWidth="1" />}
        <circle cx={x(elapsedDays)} cy={y(pointsLeft)} r="5" fill="var(--p9)" stroke="var(--card)" strokeWidth="2" />
        {hover !== null && <circle cx={x(h)} cy={y(yours(h))} r="4" fill="var(--card)" stroke="var(--p9)" strokeWidth="2" />}
        {/* line labels on the lines themselves (his ask 2026-11-14), so the chart reads without a legend */}
        <text x={x(elapsedDays) - 8} y={y(pointsLeft) - 10} textAnchor="end" fontSize="11" fontWeight="700" fill="var(--ink)">You</text>
        <text x={x(endDay) - 2} y={y(endPts) - 8} textAnchor="end" fontSize="11" fill="var(--ink-2)">Your pace</text>
        <text x={x(totalDays * 0.82)} y={y(even(totalDays * 0.82)) + 16} textAnchor="end" fontSize="11" fill="var(--ink-3)">Even pace</text>
        {hover !== null && (
          <text x={L + 4} y={T + 12} fontSize="11" fill="var(--ink-2)" className="num">{label(dateAt(h))}: you {Math.round(yours(h)).toLocaleString()}, even pace {Math.round(even(h)).toLocaleString()}</text>
        )}
      </svg>
    </div>
  );
}
