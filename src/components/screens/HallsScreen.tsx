"use client";

// Owner: Arshawn (UI). Real menus wired in by the menus code (PLAN.md, Halls tab and cafe board): src/app/halls/page.tsx passes
// today's trimmed menus (src/lib/hallsView.ts); it opens on the student's usual hall from onboarding (src/lib/profile.ts).
// The hall menus are a side-scrolling pager, one page per hall in chip order (src/components/ui/Pager.tsx, the same pager as
// Rank's matchups): a chip scrolls to its hall, a swipe selects the chip. Each hall keeps its own meal; the meal switch swaps that
// page's dishes with the blur-fade.
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Search01Icon, Cancel01Icon, CrownIcon, ArrowRight01Icon, Coffee02Icon, RiceBowl01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Pager } from "@/components/ui/Pager";
import { Screen } from "@/components/ui/Screen";
import { Seg, Appear, GooTrack } from "@/components/ui/motion";
import { useProfile } from "@/lib/profile";
import type { HallsData, HallView } from "@/lib/hallsView";
import type { HallId, MealName } from "@/lib/types";
import { MEAL_LABELS as MEALS, type MealLabel as Meal } from "./now";
import { dishPhoto } from "./dishPhoto";

const toMeal = (m: Meal): MealName => (m === "Late night" ? "Late Night" : m);
const toLabel = (m: MealName): Meal => (m === "Late Night" ? "Late night" : m);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const day = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" });
/** The meal to open on: the one being served now (or next), else the first one on today's menu. */
const mealFor = (h: HallView): Meal => toLabel(h.status.meal ?? (Object.keys(h.meals)[0] as MealName | undefined) ?? "Dinner");

export interface BestDish { name: string; hallId: HallId; hallShort: string; photo: string; votes: number }

export function HallsScreen({ data, best }: { data: HallsData; best: BestDish[] }) {
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const toggleSearch = () => { setSearching((s) => !s); setQ(""); };
  useEffect(() => { if (searching) input.current?.focus(); }, [searching]);
  // every dish on today's menus, for search: name, hall, meal
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return [];
    return data.halls.flatMap((x) => Object.entries(x.meals).flatMap(([m, list]) => (list ?? [])
      .filter((d) => d.name.toLowerCase().includes(needle))
      .map((d) => ({ d, hall: x, meal: toLabel(m as MealName) })))).slice(0, 30);
  }, [q, data.halls]);
  const profile = useProfile();
  const [hall, setHall] = useState<HallId>(data.halls[0].id);
  const at = Math.max(0, data.halls.findIndex((x) => x.id === hall));
  // each hall's meal: the one it is serving now (or next) until the student switches it
  const [meals, setMeals] = useState<Record<string, Meal>>(() => Object.fromEntries(data.halls.map((x) => [x.id, mealFor(x)])));
  const meal = meals[hall] ?? "Dinner";
  const setMeal = (m: Meal) => setMeals((ms) => ({ ...ms, [hall]: m }));
  const pick = (id: HallId) => { if (data.halls.some((x) => x.id === id)) setHall(id); };
  // open on the student's usual hall once their profile is read (it lives on the phone, so only after the page loads)
  const usual = profile?.usualHall;
  useEffect(() => { if (usual) pick(usual); }, [usual]); // eslint-disable-line react-hooks/exhaustive-deps
  // keep the selected chip in view when a swipe changes the hall
  const chips = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLElement | null)[]>([]);
  // the chip follows the swipe as it happens (his ask 2026-11-14: "i dont want the chip to change at the end but while its going"),
  // on the goo thumb with the one spring (DESIGN motion.goo, motion.spring)
  const [live, setLive] = useState<number | null>(null);
  const chipAt = live ?? at;
  const reduce = useReducedMotion();
  useEffect(() => {
    const row = chips.current, chip = chipRefs.current[chipAt];
    if (!row || !chip) return;
    const left = chip.offsetLeft - (chipRefs.current[0]?.offsetLeft ?? 0);
    if (left < row.scrollLeft || left + chip.offsetWidth > row.scrollLeft + row.clientWidth - 32) row.scrollTo({ left: Math.max(0, left - 16), behavior: reduce ? "instant" : "smooth" });
  }, [chipAt, reduce]);
  return (
    <Screen top={<div className="topbar">
        <h1 className="title-xl">Halls</h1>
      </div>}>
      <Appear id={searching ? "search" : "browse"} style={{ display: "grid", gap: 10 }}>
      {searching ? <>
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={input} autoFocus className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search today's menus" aria-label="Search today's menus" />
          <button type="button" className="iconbtn raised" aria-label="Close search" onClick={toggleSearch}><Icon icon={Cancel01Icon} size={20} /></button>
        </div>
        {q.trim().length >= 2 && results.length === 0 && <div className="card"><div className="label">Nothing called that on today&apos;s menus.</div></div>}
        {results.map(({ d, hall: x, meal: m }) => {
          const photo = dishPhoto(d.name);
          return (
            <button type="button" className="card tight press link" key={`${x.id}-${m}-${d.recipeId}`} onClick={() => { setHall(x.id); setMeals((ms) => ({ ...ms, [x.id]: m })); setSearching(false); setQ(""); }}
              style={{ display: "flex", gap: 12, alignItems: "center", textAlign: "left", width: "100%", font: "inherit", color: "inherit", border: 0, paddingRight: 32 }}>
              <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
              {photo ? <Photo src={photo} w={48} h={48} r={12} /> : <span className="iconbtn" aria-hidden style={{ width: 48, height: 48, borderRadius: 12, background: "var(--paper-2)" }}><Icon icon={RiceBowl01Icon} size={20} /></span>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>{d.name}</div>
                <div className="num label" style={{ fontSize: 12, marginTop: 2 }}>{[x.short, m, d.calories !== undefined ? `${d.calories} cal` : null].filter(Boolean).join(" · ")}</div>
              </div>
            </button>
          );
        })}
      </> : <>
      <div style={{ display: "flex", gap: 8 }}>
        <Seg options={MEALS} value={meal} onChange={setMeal} label="Meal" className="raised"
          render={(o) => (o === "Late night" ? <><span className="seg-long">Late night</span><span className="seg-short">Late</span></> : o)} />
        <button type="button" className="iconbtn raised" style={{ marginLeft: "auto" }} aria-label="Search dishes" onClick={toggleSearch}><Icon icon={Search01Icon} size={20} /></button>
      </div>

      {best.length > 0 && <>
      <div className="sechead"><h2>Best on campus</h2><Link href="/rank?view=Leaderboard" className="seeall">See all</Link></div>
      <div className="carousel">
        {best.map((d, i) => (
          <button type="button" key={`${d.hallId}-${d.name}`} className="duel-opt" onClick={() => pick(d.hallId)}
            style={{ width: 156, alignContent: "start", justifyItems: "start", textAlign: "left", gap: 6 }}>
            <Photo src={d.photo} w={156} h={156} r={16}>
              {i === 0 && <span className="on-photo gold"><Icon icon={CrownIcon} size={12} sw={2.2} /> #1</span>}
            </Photo>
            <div className="clamp2" title={d.name} style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2, height: "2.4em", padding: "0 4px" }}>{d.name}</div>
            <div className="label" style={{ fontSize: 12, marginTop: -3, padding: "0 4px" }}>{[d.hallShort, d.votes > 0 ? `${d.votes} ${d.votes === 1 ? "vote" : "votes"}` : null].filter(Boolean).join(" · ")}</div>
          </button>
        ))}
      </div>
      </>}

      <div ref={chips} className="carousel" style={{ marginTop: 4, scrollSnapType: "none" }}>
        <div className="chip-goo">
          <GooTrack index={chipAt} refs={chipRefs} fill="var(--p9)" />
          {data.halls.map((x, n) => (
            <button key={x.id} ref={(el) => { chipRefs.current[n] = el; }} type="button" className={`chip chip-sm ${chipAt === n ? "on" : ""}`} onClick={() => pick(x.id)}>
              <span>{x.short}</span>
            </button>
          ))}
        </div>
      </div>

      <Pager index={at} onIndex={(n) => { setLive(null); setHall(data.halls[n].id); }} onLive={setLive} label="Hall menus" fitHeight>
        {data.halls.map((x) => <HallPage key={x.id} h={x} meal={meals[x.id] ?? "Dinner"} data={data} />)}
      </Pager>

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
      </>}
      </Appear>
    </Screen>
  );
}

/** One hall's page in the pager: "<hall>, <meal>", its status, and that meal's dishes (blur-fade when the meal changes). */
function HallPage({ h, meal, data }: { h: HallView; meal: Meal; data: HallsData }) {
  const dishes = h.meals[toMeal(meal)] ?? [];
  return (
    <Appear id={h.id + meal} style={{ display: "grid", gap: 10 }}>
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
  );
}
