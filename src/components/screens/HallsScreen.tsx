"use client";

// Owner: Arshawn (UI). Real menus wired in by the menus code (PLAN.md, Halls tab and cafe board): src/app/halls/page.tsx passes
// today's trimmed menus (src/lib/hallsView.ts); it opens on the student's usual hall from onboarding (src/lib/profile.ts).
import { useEffect, useState } from "react";
import { Search01Icon, StarIcon, Coffee02Icon, RiceBowl01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { Seg, Appear } from "@/components/ui/motion";
import { useProfile } from "@/lib/profile";
import type { HallsData, HallView } from "@/lib/hallsView";
import type { HallId, MealName } from "@/lib/types";
import { DISHES, BEST_TONIGHT, MEALS, type Meal } from "./demo";
import { dishPhoto } from "./dishPhoto";

const toMeal = (m: Meal): MealName => (m === "Late night" ? "Late Night" : m);
const toLabel = (m: MealName): Meal => (m === "Late Night" ? "Late night" : m);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const day = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" });
/** The meal to open on: the one being served now (or next), else the first one on today's menu. */
const mealFor = (h: HallView): Meal => toLabel(h.status.meal ?? (Object.keys(h.meals)[0] as MealName | undefined) ?? "Dinner");

export function HallsScreen({ data }: { data: HallsData }) {
  const profile = useProfile();
  const [hall, setHall] = useState<HallId>(data.halls[0].id);
  const h = data.halls.find((x) => x.id === hall) ?? data.halls[0];
  const [meal, setMeal] = useState<Meal>(() => mealFor(data.halls[0]));
  const pick = (id: HallId) => {
    const next = data.halls.find((x) => x.id === id);
    if (!next) return;
    setHall(id);
    setMeal(mealFor(next));
  };
  // open on the student's usual hall once their profile is read (it lives on the phone, so only after the page loads)
  const usual = profile?.usualHall;
  useEffect(() => { if (usual) pick(usual); }, [usual]); // eslint-disable-line react-hooks/exhaustive-deps
  const dishes = h.meals[toMeal(meal)] ?? [];
  return (
    <Screen top={<div className="topbar">
        <h1 className="title-xl">Halls</h1>
        <button type="button" className="iconbtn" aria-label="Search dishes"><Icon icon={Search01Icon} size={18} /></button>
      </div>}>
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
        {data.halls.map((x) => (
          <button key={x.id} type="button" className={`chip chip-sm ${hall === x.id ? "on" : ""}`} onClick={() => pick(x.id)}>
            {x.short}
          </button>
        ))}
      </div>

      <Appear id={hall + meal} style={{ display: "grid", gap: 10 }}>
        <div className="sechead"><h2>{h.short}, {meal.toLowerCase()}</h2><span className="tint blue" style={{ height: 24, fontSize: 12 }}>{cap(h.status.text)}</span></div>
        {data.menuDate !== data.date && (
          <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>{data.mock ? "Sample menu: no UCSC menus are saved yet." : `${day(data.date)} isn't posted yet, so this is ${day(data.menuDate)}'s menu.`}</p>
        )}
        {dishes.length === 0 && (
          <div className="card"><div className="label">{h.hours.length === 0 ? `${h.short} is closed today.` : `No ${meal.toLowerCase()} at ${h.short} today.`}</div></div>
        )}
        {dishes.map((d) => {
          const photo = dishPhoto(d.name);
          return (
            <div className="card tight" key={d.recipeId + d.name} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>{d.name}</div>
                <div className="num label" style={{ fontSize: 12, marginTop: 2 }}>{[d.calories !== undefined ? `${d.calories} cal` : "No label", d.portion].filter(Boolean).join(" · ")}</div>
              </div>
              {photo
                ? <Photo src={photo} w={64} h={64} r={12} />
                : <span className="iconbtn" aria-hidden style={{ width: 64, height: 64, borderRadius: 12, background: "var(--paper-2)" }}><Icon icon={RiceBowl01Icon} size={22} /></span>}
            </div>
          );
        })}
        {dishes.length > 0 && <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>Plus the salad bar, deli bar, cereal, fruit and drinks.</p>}
      </Appear>

      <div className="sechead" style={{ marginTop: 6 }}><h2>Cafe board</h2><span className="label" style={{ fontSize: 12 }}>Same menu every day</span></div>
      <div className="card" style={{ padding: "2px 14px" }}>
        {data.cafes.map((c) => (
          <div className="row" key={c.id}>
            <span className="iconbtn" style={{ width: 36, height: 36, background: "var(--paper-2)" }}><Icon icon={Coffee02Icon} size={17} /></span>
            <div className="grow"><div className="title">{c.name}</div><div className="sub">{[c.location, ...c.highlights].join(" · ")}</div></div>
            <span className="num label" style={{ fontSize: 12 }}>{c.itemCount} items</span>
          </div>
        ))}
      </div>
    </Screen>
  );
}
