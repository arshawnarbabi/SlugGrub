// Owner: Arshawn. Today tab (PLAN.md, "Today page cards").
import Link from "next/link";
import { Location01Icon, Notification01Icon, CrownIcon, StarIcon, ArrowUp01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { CountUp } from "@/components/ui/motion";
import { DISHES, BEST_TONIGHT, USER } from "./demo";

export function TodayScreen() {
  const top = DISHES.tikka;
  const pct = Math.round((USER.points / USER.pointsTotal) * 100);
  return (
    <Screen wash top={<div className="topbar">
        <span className="tint blue"><Icon icon={Location01Icon} size={14} sw={2} /> {USER.hall}</span>
        <button type="button" className="iconbtn" aria-label="Notifications"><Icon icon={Notification01Icon} size={18} /></button>
      </div>}>

      <div>
        <div className="label">Dinner · open till 8 PM</div>
        <h1 className="title-xl">Good evening, {USER.name}</h1>
      </div>

      <Link href="/halls" className="card flush press link">
        <span className="card-chev on-img" aria-hidden><Icon icon={ArrowRight01Icon} size={15} sw={2} /></span>
        <Photo src={top.photo} h={170} r={0} eager>
          <span className="on-photo gold"><Icon icon={CrownIcon} size={13} sw={2} /> #1 at your hall</span>
        </Photo>
        <div style={{ padding: "12px 14px 14px", display: "grid", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <b style={{ fontSize: 17, letterSpacing: "-0.02em" }}>{top.name}</b>
            <span className="num" style={{ display: "inline-flex", gap: 4, alignItems: "center", fontSize: 13, color: "var(--ink-2)" }}><Icon icon={StarIcon} size={13} sw={2} color="var(--y11)" />{top.score}</span>
          </div>
          <div className="num label">{top.cal} cal · {top.portion} · ranked by 37 students</div>
        </div>
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Link href="/budget" className="card press link">
          <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
          <div className="label">Slug Points</div>
          <div className="num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 2 }}><CountUp to={USER.points} /></div>
          <div style={{ height: 6, background: "var(--paper-2)", borderRadius: 9, marginTop: 6, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: "var(--p9)", borderRadius: 9 }} /></div>
          <div style={{ fontSize: 12, color: "var(--ok)", marginTop: 6, fontWeight: 700 }}>On pace</div>
        </Link>
        <Link href="/rank?view=Leaderboard" className="card press link">
          <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
          <div className="label">Your college</div>
          <div className="num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 2 }}>#3</div>
          <div className="label" style={{ fontSize: 12, marginTop: 2 }}>{USER.college} this week</div>
          <span className="delta up" style={{ marginTop: 6 }}><Icon icon={ArrowUp01Icon} size={12} sw={2.4} />1</span>
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
