"use client";

// Owner: Arshawn (UI). Ethan wires real menus into it (PLAN.md, Halls tab and cafe board).
import { useState } from "react";
import { Search01Icon, StarIcon, Coffee02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { Seg, Appear } from "@/components/ui/motion";
import { DISHES, BEST_TONIGHT, HALLS, CAFES, MEALS, MENU_BY_MEAL, type Meal } from "./demo";

export function HallsScreen() {
  const [meal, setMeal] = useState<Meal>("Dinner");
  const [hall, setHall] = useState(HALLS[0].id);
  const h = HALLS.find((x) => x.id === hall)!;
  return (
    <Screen>
      <div className="topbar">
        <h1 className="title-xl">Halls</h1>
        <button type="button" className="iconbtn" aria-label="Search dishes"><Icon icon={Search01Icon} size={18} /></button>
      </div>
      <Seg options={MEALS} value={meal} onChange={setMeal} label="Meal" />

      <div className="sechead"><h2>Best on campus</h2><span className="seeall">See all</span></div>
      <div className="carousel">
        {BEST_TONIGHT.map((id) => {
          const d = DISHES[id];
          return (
            <div key={id} className="press" style={{ width: 156, display: "grid", gap: 6 }}>
              <Photo src={d.photo} w={156} h={156}>
                <span className="on-photo"><Icon icon={StarIcon} size={12} sw={2.2} color="var(--y11)" />{d.score}</span>
              </Photo>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{d.name}</div>
              <div className="label" style={{ fontSize: 12, marginTop: -3 }}>{d.hall}</div>
            </div>
          );
        })}
      </div>

      <div className="carousel" style={{ marginTop: 4 }}>
        {HALLS.map((x) => (
          <button key={x.id} type="button" className={`chip chip-sm ${hall === x.id ? "on" : ""}`} onClick={() => setHall(x.id)}>
            {x.short}
          </button>
        ))}
      </div>

      <Appear key={hall + meal} style={{ display: "grid", gap: 10 }}>
        <div className="sechead"><h2>{h.short}, {meal.toLowerCase()}</h2><span className="tint blue" style={{ height: 24, fontSize: 12 }}>{h.open}</span></div>
        {MENU_BY_MEAL[meal].map((id) => {
          const d = DISHES[id];
          return (
            <div className="card tight press" key={id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>{d.name}</div>
                <div className="num label" style={{ fontSize: 12, marginTop: 2 }}>{d.cal} cal · {d.portion} · <span style={{ color: "var(--ink-2)" }}>{d.score}</span></div>
              </div>
              <Photo src={d.photo} w={64} h={64} r={12} />
            </div>
          );
        })}
      </Appear>

      <div className="sechead" style={{ marginTop: 6 }}><h2>Cafe board</h2><span className="label" style={{ fontSize: 12 }}>Same menu every day</span></div>
      <div className="card" style={{ padding: "2px 14px" }}>
        {CAFES.map((c) => (
          <div className="row" key={c.name}>
            <span className="iconbtn" style={{ width: 36, height: 36, background: "var(--paper-2)" }}><Icon icon={Coffee02Icon} size={17} /></span>
            <div className="grow"><div className="title">{c.item}</div><div className="sub">{c.name}</div></div>
            <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>{c.score}</span>
          </div>
        ))}
      </div>
    </Screen>
  );
}
