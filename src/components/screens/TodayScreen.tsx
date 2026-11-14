// Owner: Arshawn. Today tab (PLAN.md, "Today page cards"). Reads Karen's and Ethan's lib functions; demo.ts fills what they don't
// return yet (photos, the star score, the best-on-campus list, the student's name, hall and plan until onboarding exists).
import Link from "next/link";
import { cacheLife } from "next/cache";
import { Location01Icon, Notification01Icon, CrownIcon, StarIcon, ArrowUp01Icon, ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { CountUp } from "@/components/ui/motion";
import { getTopDishNow, getLeaderboard } from "@/lib/rankings";
import { getBudgetSnapshot } from "@/lib/budget";
import { getMenu } from "@/lib/menus";
import { HALLS, MEAL_PLANS } from "@/lib/halls";
import type { HallId } from "@/lib/types";
import { DISHES, BEST_TONIGHT, USER, dishPhoto } from "./demo";
import { campusNow, greeting, hoursFor, mealLabel, mealStatus } from "./now";
import { CaloriesToday } from "./CaloriesToday";

const PACE = { "on-pace": ["On pace", "var(--ok)"], fast: ["Spending fast", "var(--bad)"], slow: ["Spending slow", "var(--ink-2)"] } as const;

// Everything Today shows, read once a minute at most (cacheLife "minutes"), so the page still opens static and the meal and hours
// follow the campus clock. TODO (team): when rankings or budget become per-student (cookies, sign-in), move those reads out of here.
async function loadToday(hallId: HallId) {
  "use cache";
  cacheLife("minutes");
  const now = campusNow(new Date());
  const [top, board, budget, menu] = await Promise.all([getTopDishNow(hallId), getLeaderboard(), getBudgetSnapshot(), getMenu(now.date, hallId)]);
  const dish = top ? Object.values(menu?.meals ?? {}).flat().find((d) => d?.recipeId === top.recipeId) : undefined;
  const collegeHall = HALLS.find((h) => h.colleges.some((c) => c === USER.college))?.id;
  return {
    status: mealStatus(hoursFor(hallId), now.minutes),
    hello: greeting(now.minutes),
    top: top && { ...top, cal: dish?.nutrition?.calories, portion: dish?.portion ?? undefined },
    standing: board.find((s) => s.hallId === collegeHall) ?? null,
    budget,
  };
}

export async function TodayScreen() {
  const hall = HALLS.find((h) => h.short === USER.hall) ?? HALLS[0]; // TODO: usual hall from onboarding (Ethan)
  const { status, hello, top, standing, budget } = await loadToday(hall.id);
  const demo = top ? Object.values(DISHES).find((d) => d.name === top.name) : undefined;
  const photo = top ? dishPhoto(top.name) : undefined;
  const total = MEAL_PLANS.find((p) => p.label === USER.plan)?.pointsPerQuarter ?? USER.pointsTotal;
  const pct = Math.max(0, Math.min(100, Math.round((budget.pointsLeft / total) * 100)));
  const [paceText, paceColor] = PACE[budget.pace];
  return (
    <Screen wash top={<div className="topbar">
        <span className="tint blue fit"><Icon icon={Location01Icon} size={14} sw={2} /><span className="clip">{hall.short} · {mealLabel(status.meal)} · {status.text}</span></span>
        <button type="button" className="iconbtn" aria-label="Notifications"><Icon icon={Notification01Icon} size={18} /></button>
      </div>}>

      <h1 className="title-xl">{hello}, {USER.name}</h1>

      {top && (
        <Link href="/halls" className={`card press link ${photo ? "flush" : ""}`}>
          <span className={`card-chev ${photo ? "on-img" : ""}`} aria-hidden><Icon icon={ArrowRight01Icon} size={photo ? 15 : 16} sw={2} /></span>
          {photo
            ? <Photo src={photo} h={170} r={0} eager><span className="on-photo gold"><Icon icon={CrownIcon} size={13} sw={2} /> #1 at your hall</span></Photo>
            : <span className="tint gold" style={{ marginBottom: 8 }}><Icon icon={CrownIcon} size={13} sw={2} /> #1 at your hall</span>}
          <div style={{ padding: photo ? "12px 14px 14px" : 0, display: "grid", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <b style={{ fontSize: 17, letterSpacing: "-0.02em" }}>{top.name}</b>
              {demo && <span className="num" style={{ display: "inline-flex", gap: 4, alignItems: "center", fontSize: 13, color: "var(--ink-2)" }}><Icon icon={StarIcon} size={13} sw={2} color="var(--y11)" />{demo.score}</span>}
            </div>
            <div className="num label">{[top.cal !== undefined && `${top.cal} cal`, top.portion, `ranked by ${top.votes} students`].filter(Boolean).join(" · ")}</div>
          </div>
        </Link>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Link href="/budget" className="card press link">
          <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
          <div className="label">Slug Points</div>
          <div className="num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 2 }}><CountUp to={budget.pointsLeft} /></div>
          <div style={{ height: 6, background: "var(--paper-2)", borderRadius: 9, marginTop: 6, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: "var(--p9)", borderRadius: 9 }} /></div>
          <div style={{ fontSize: 12, color: paceColor, marginTop: 6, fontWeight: 700 }}>{paceText}</div>
        </Link>
        <Link href="/rank?view=Leaderboard" className="card press link">
          <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
          <div className="label">Your college</div>
          <div className="num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 2 }}>{standing ? `#${standing.rank}` : "–"}</div>
          <div className="label" style={{ fontSize: 12, marginTop: 2 }}>{USER.college} this week</div>
          {standing && standing.change > 0 && <span className="delta up" style={{ marginTop: 6 }}><Icon icon={ArrowUp01Icon} size={12} sw={2.4} />{standing.change}</span>}
          {standing && standing.change < 0 && <span className="delta down" style={{ marginTop: 6 }}><Icon icon={ArrowDown01Icon} size={12} sw={2.4} />{-standing.change}</span>}
        </Link>
      </div>

      <Link href="/rank" className="card tight press link" style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 32 }}>
        <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
        <Photo src={DISHES.padthai.photo} w={44} h={44} r={12} />
        <Photo src={DISHES.wrap.photo} w={44} h={44} r={12} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ fontSize: 14 }}>Rank your lunch</b>
          <div className="label" style={{ fontSize: 12 }}>Pad thai or the wrap?</div>
        </div>
      </Link>

      <CaloriesToday />

      <div className="sechead" style={{ marginTop: 6 }}><h2>Best on campus tonight</h2><Link href="/halls" className="seeall">See all</Link></div>
      <div className="card" style={{ padding: "2px 14px" }}>
        {BEST_TONIGHT.map((id, i) => {
          const d = DISHES[id];
          return (
            <div className="row" key={id}>
              <span className="num" style={{ width: 16, fontWeight: 700, color: i === 0 ? "var(--y11)" : "var(--ink-3)" }}>{i + 1}</span>
              <Photo src={d.photo} w={48} h={48} r={12} />
              <div className="grow"><div className="title">{d.name}</div><div className="sub num">{d.hall} · {d.cal} cal</div></div>
              <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>{d.score}</span>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
