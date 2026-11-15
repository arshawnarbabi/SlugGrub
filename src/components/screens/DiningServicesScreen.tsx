"use client";

// Owner: Arshawn (UI). Karen's dining services view (startup pitch): loved and skipped dishes by hall, from stored votes and skips.
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { Appear } from "@/components/ui/motion";
import { HALLS } from "@/lib/halls";
import type { HallId } from "@/lib/types";
import { diningInsights, mergeDishes, type CatalogDish } from "@/lib/rankCore";
import { useRankState } from "@/lib/rankClient";
import { DishThumb, hallShort } from "./rankBits";

export function DiningServicesScreen({ catalog }: { catalog: CatalogDish[] }) {
  const { state, error } = useRankState(catalog);
  const [hall, setHall] = useState<HallId | "all">("all");
  const report = useMemo(() => diningInsights(mergeDishes(catalog, state?.dishes ?? {}), hall === "all" ? undefined : hall), [catalog, state, hall]);
  const loved = report.lovedDishes.slice(0, 5);
  const skipped = report.skippedDishes.slice(0, 5);
  const id = `${hall}-${state ? "live" : "wait"}`;
  return (
    <Screen noTabBar top={<div className="topbar">
        <Link href="/" className="iconbtn" aria-label="Back"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
        <span className="center">Dining services</span>
        <span style={{ width: 38 }} />
      </div>}>
<h1 className="title-xl">What students love</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="radiogroup" aria-label="Dining hall">
        {([["all", "All halls"], ...HALLS.map((h) => [h.id, h.short])] as [HallId | "all", string][]).map(([k, label]) => (
          <button key={k} type="button" role="radio" aria-checked={hall === k} className={`chip chip-sm ${hall === k ? "on" : ""}`} onClick={() => setHall(k)}>{label}</button>
        ))}
      </div>
      <Appear id={id} style={{ display: "grid", gap: 14 }}>
        <div className="label">{state ? `From ${report.totalVotes.toLocaleString()} ${report.totalVotes === 1 ? "matchup" : "matchups"} and ${report.totalSkips.toLocaleString()} ${report.totalSkips === 1 ? "skip" : "skips"}` : " "}</div>
        <div className="card" style={{ padding: "2px 14px" }}>
          {loved.length === 0 && <div className="row"><div className="grow"><div className="sub">{state ? "No clear favorites yet. Votes show up here as students rank." : " "}</div></div></div>}
          {loved.map((d, i) => (
            <div className="row" key={`${d.hallId}_${d.recipeId}`}>
              <span className="num" style={{ width: 16, fontWeight: 700, color: i === 0 ? "var(--y11)" : "var(--ink-3)" }}>{i + 1}</span>
              <DishThumb name={d.name} w={44} h={44} />
              <div className="grow"><div className="title">{d.name}</div><div className="sub num">{hallShort(d.hallId)} · won {d.winRate}% of {d.votes}</div></div>
              <span className="num" style={{ fontWeight: 700 }}>{d.elo.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="sechead"><h2>Least picked</h2></div>
        <div className="card" style={{ padding: "2px 14px" }}>
          {skipped.length === 0 && <div className="row"><div className="grow"><div className="sub">{state ? "No dish is losing yet." : " "}</div></div></div>}
          {skipped.map((s) => (
            <div className="row" key={`${s.hallId}_${s.recipeId}`}>
              <div className="grow"><div className="title">{s.name}</div><div className="sub">{hallShort(s.hallId)}</div></div>
              <span className="label num" style={{ fontSize: 12 }}>{[s.skips > 0 && `skipped ${s.skips}`, s.losses > 0 && `lost ${s.losses}`].filter(Boolean).join(" · ")}</span>
            </div>
          ))}
        </div>
        {report.recommendations.length > 0 && (
          <div className="card" style={{ display: "grid", gap: 6 }}>
            {report.recommendations.map((r) => <div key={r} className="body" style={{ fontSize: 15 }}>{r}</div>)}
          </div>
        )}
      </Appear>
      {error && <div className="label" style={{ fontSize: 12, textAlign: "center" }}>{error}</div>}
    </Screen>
  );
}
