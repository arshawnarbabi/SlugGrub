"use client";

// Owner: Arshawn (UI; moved out of MoreScreens.tsx with its look unchanged). Wired by the menus code to /api/ask
// (src/app/api/ask/contract.ts): Gemini picks from the meal each hall is serving now; calories come from the UCSC labels.
// Layout (his review 2026-11-14): title and answers on top, suggestions and the Sidestash prompt bar at the bottom, above the nav bar.
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft01Icon, SparklesIcon, RiceBowl01Icon, Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { Appear } from "@/components/ui/motion";
import { ASK_MAX_CHARS, type AskResponse } from "@/app/api/ask/contract";
import { dishPhoto } from "./dishPhoto";
import { portionText } from "./portion";

const SUGGESTIONS = ["High protein under 700 cal", "Best vegetarian right now", "Something warm near Porter"];

type State = { phase: "idle" } | { phase: "asking"; q: string } | { phase: "done"; q: string; res: AskResponse };

export function AskScreen() {
  const [q, setQ] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ask = async (text: string) => {
    const question = text.trim().slice(0, ASK_MAX_CHARS);
    if (!question || state.phase === "asking") return;
    setState({ phase: "asking", q: question });
    let res: AskResponse;
    try {
      res = await (await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) })).json();
    } catch {
      res = { ok: false, error: "gemini_error", message: "Couldn't reach SlugGrub. Check your connection and try again." };
    }
    setState({ phase: "done", q: question, res });
  };
  const key = state.phase === "idle" ? "idle" : `${state.phase}:${state.q}`;
  return (
    <Screen top={<div className="topbar">
        <Link href="/" className="iconbtn" aria-label="Back"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
        <span className="center">Ask SlugGrub</span>
        <span style={{ width: 38 }} />
      </div>}>
<h1 className="title-xl">What are you in the mood for?</h1>
      {state.phase !== "idle" && (
        <Appear id={key} style={{ display: "grid", gap: 10 }}>
          {state.phase === "asking" && <div className="label">Reading what the halls are serving now</div>}
          {state.phase === "done" && !state.res.ok && (
            <div className="card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span className="iconbtn" style={{ width: 44, height: 44, background: "var(--paper-2)" }}><Icon icon={Alert02Icon} size={20} sw={2} /></span>
              <div className="body" style={{ flex: 1, minWidth: 0 }}>{state.res.message}</div>
            </div>
          )}
          {state.phase === "done" && state.res.ok && (
            <>
              <div className="label">For &ldquo;{state.q}&rdquo;</div>
              <p className="body" style={{ margin: 0 }}>{state.res.answer}</p>
              {state.res.picks.map((d) => {
                const photo = dishPhoto(d.name);
                return (
                  <div className="card tight" key={d.hallId + d.recipeId} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {photo
                      ? <Photo src={photo} w={56} h={56} r={12} />
                      : <span className="iconbtn" aria-hidden style={{ width: 56, height: 56, borderRadius: 12, background: "var(--paper-2)" }}><Icon icon={RiceBowl01Icon} size={20} /></span>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{d.name}</div>
                      <div className="num label" style={{ fontSize: 12 }}>{[d.hallShort, d.calories !== undefined ? `${d.calories} cal` : "no label", d.proteinG !== undefined ? `${d.proteinG}g protein` : "", portionText(d.portion)].filter(Boolean).join(" · ")}</div>
                      <div className="label" style={{ fontSize: 12 }}>{d.open ? d.reason : `${d.reason} · ${d.when}`}</div>
                    </div>
                  </div>
                );
              })}
              {state.res.fallback && <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>Today&apos;s menus aren&apos;t saved yet, so these come from the nearest day.</p>}
            </>
          )}
        </Appear>
      )}
      {/* suggestions sit just above the prompt bar at the bottom (his review 2026-11-14, S09) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto", paddingTop: 8 }}>
        {SUGGESTIONS.map((s) => <button key={s} type="button" className="tint blue" onClick={() => { setQ(s); ask(s); }}>{s}</button>)}
      </div>
      <form className="ask-dock" style={{ position: "sticky" }} onSubmit={(e) => { e.preventDefault(); ask(q); }}>
        <input id="ask" className="input raised" value={q} onChange={(e) => setQ(e.target.value)} maxLength={ASK_MAX_CHARS} placeholder="High protein under 700 cal" aria-label="Ask SlugGrub" enterKeyHint="send" style={{ flex: 1, fontSize: 16 }} />
        <button type="submit" className="iconbtn send" disabled={state.phase === "asking"} aria-label="Ask"><Icon icon={SparklesIcon} size={20} sw={1.9} /></button>
      </form>
    </Screen>
  );
}
