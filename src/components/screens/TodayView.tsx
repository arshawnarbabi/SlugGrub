"use client";

// Owner: Arshawn. Today's cards, laid out as before; the student's hall, college, plan and points come from the profile saved on
// this device (src/lib/profile.ts). Before a profile exists the plan and college cards point to onboarding instead of showing
// made-up numbers. While the page renders on the server (no profile yet) those two cards keep their shape with no values.
import Link from "next/link";
import { Location01Icon, UserCircleIcon, CrownIcon, ArrowRight01Icon, RiceBowl01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { CountUp } from "@/components/ui/motion";
import { useProfile } from "@/lib/profile";
import { computeBudgetSnapshot } from "@/lib/budgetCalc";
import type { HallId } from "@/lib/types";
import type { MealNow } from "@/lib/halls";
import { mealLabel } from "./now";
import { CaloriesToday } from "./CaloriesToday";

export interface TodayHall {
  short: string;
  status: MealNow;
  top: { name: string; votes: number; photo: string | null; cal?: number; portion?: string } | null;
  pair: { name: string; photo: string | null }[];
}
export interface TodayData {
  hello: string;
  halls: Record<HallId, TodayHall>;
  rivalry: { college: string; rank: number }[];
  best: { name: string; hall: string; cal?: number; photo: string | null; elo: number }[];
}

const DEFAULT_HALL: HallId = "40";
const PACE = { "on-pace": ["On pace", "var(--ok)"], fast: ["Spending fast", "var(--bad)"], slow: ["Spending slow", "var(--ink-2)"] } as const;
const big = { fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 2 } as const;

function DishTile({ size, r = 12 }: { size: number; r?: number }) {
  return <span style={{ width: size, height: size, borderRadius: r, background: "var(--paper-2)", display: "grid", placeItems: "center", color: "var(--ink-3)", flex: "none" }}><Icon icon={RiceBowl01Icon} size={Math.round(size * 0.45)} /></span>;
}

export function TodayView({ data }: { data: TodayData }) {
  const profile = useProfile(); // undefined on the server, null when none is saved
  const hallId = profile?.usualHall ?? DEFAULT_HALL;
  const hall = data.halls[hallId] ?? data.halls[DEFAULT_HALL];
  // usual hall closed or empty today (two halls close on weekends): show the best dish at a hall that's open instead
  const alt = hall.top ? null : Object.values(data.halls).find((h) => h.status.open && h.top) ?? Object.values(data.halls).find((h) => h.top) ?? null;
  const top = hall.top ?? alt?.top ?? null;
  const topTag = alt ? `#1 at ${alt.short}` : "#1 at your hall";
  const budget = profile ? computeBudgetSnapshot(profile.pointsNow, profile.plan, new Date(), profile.savedAt.slice(0, 10)) : null;
  const pct = budget ? Math.max(0, Math.min(100, Math.round((budget.pointsLeft / (budget.planTotal ?? budget.pointsLeft)) * 100))) : 0;
  const standing = profile ? data.rivalry.find((r) => r.college === profile.college) : undefined;
  const [a, b] = hall.pair.length >= 2 ? hall.pair : (alt?.pair ?? []);
  const statusText = hall.status.meal ? `${mealLabel(hall.status.meal)} · ${hall.status.text}` : hall.status.text;

  return (
    <Screen wash top={<div className="topbar">
        <span className="tint blue fit"><Icon icon={Location01Icon} size={14} sw={2} /><span className="clip">{hall.short} · {statusText}</span></span>
        <Link href="/onboarding" className="iconbtn" aria-label="Your profile"><Icon icon={UserCircleIcon} size={18} /></Link>
      </div>}>

      <h1 className="title-xl">{data.hello}{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}</h1>

      {top && (
        <Link href="/halls" className={`card press link ${top.photo ? "inset" : ""}`}>
          <span className={`card-chev ${top.photo ? "on-img" : ""}`} aria-hidden><Icon icon={ArrowRight01Icon} size={top.photo ? 15 : 16} sw={2} /></span>
          {top.photo
            ? <Photo src={top.photo} h={170} r={16} eager><span className="on-photo gold"><Icon icon={CrownIcon} size={13} sw={2} /> {topTag}</span></Photo>
            : <span className="tint gold" style={{ marginBottom: 8 }}><Icon icon={CrownIcon} size={13} sw={2} /> {topTag}</span>}
          <div style={{ padding: top.photo ? "12px 6px 6px" : 0, display: "grid", gap: 4 }}>
            <b style={{ fontSize: 17, letterSpacing: "-0.02em" }}>{top.name}</b>
            <div className="num label">{[top.cal !== undefined && `${top.cal} cal`, top.portion, top.votes > 0 ? `ranked by ${top.votes} ${top.votes === 1 ? "vote" : "votes"}` : "be the first to rank it"].filter(Boolean).join(" · ")}</div>
          </div>
        </Link>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Link href={profile === null ? "/onboarding" : "/budget"} className="card press link">
          <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
          <div className="label">Slug Points</div>
          {budget ? <>
            <div className="num" style={big}><CountUp to={budget.pointsLeft} /></div>
            <div style={{ height: 6, background: "var(--paper-2)", borderRadius: 9, marginTop: 6, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: "var(--p9)", borderRadius: 9 }} /></div>
            <div style={{ fontSize: 12, color: PACE[budget.pace][1], marginTop: 6, fontWeight: 700 }}>{PACE[budget.pace][0]}</div>
          </> : <>
            <div className="num" style={{ ...big, color: "var(--ink-3)" }}>–</div>
            <div className="label" style={{ fontSize: 12, marginTop: 8 }}>{profile === null ? "Add your plan" : " "}</div>
          </>}
        </Link>
        <Link href={profile === null ? "/onboarding" : "/rank?view=Leaderboard"} className="card press link">
          <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
          <div className="label">Your college</div>
          <div className="num" style={{ ...big, color: standing ? undefined : "var(--ink-3)" }}>{standing ? `#${standing.rank}` : "–"}</div>
          <div className="label" style={{ fontSize: 12, marginTop: 2 }}>{profile ? `${profile.college} this week` : profile === null ? "Pick your college" : " "}</div>
        </Link>
      </div>

      {a && b && (
        <Link href="/rank" className="card tight press link" style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 32 }}>
          <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
          {a.photo ? <Photo src={a.photo} w={44} h={44} r={12} /> : <DishTile size={44} />}
          {b.photo ? <Photo src={b.photo} w={44} h={44} r={12} /> : <DishTile size={44} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 14 }}>Rank today&apos;s food</b>
            <div className="label" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name} or {b.name}?</div>
          </div>
        </Link>
      )}

      <CaloriesToday />

      {data.best.length > 0 && <>
        <div className="sechead" style={{ marginTop: 6 }}><h2>Best on campus today</h2><Link href="/rank?view=Leaderboard" className="seeall">See all</Link></div>
        <div className="card" style={{ padding: "2px 14px" }}>
          {data.best.map((d, i) => (
            <div className="row" key={`${d.hall}-${d.name}`}>
              <span className="num" style={{ width: 16, fontWeight: 700, color: i === 0 ? "var(--y11)" : "var(--ink-3)" }}>{i + 1}</span>
              {d.photo ? <Photo src={d.photo} w={48} h={48} r={12} /> : <DishTile size={48} />}
              <div className="grow"><div className="title">{d.name}</div><div className="sub num">{[d.hall, d.cal !== undefined && `${d.cal} cal`].filter(Boolean).join(" · ")}</div></div>
              <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>{d.elo}</span>
            </div>
          ))}
        </div>
      </>}
    </Screen>
  );
}
