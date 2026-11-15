"use client";

// Owner: Arshawn (UI). Vote and Dining services: Karen wires data. Onboarding and Ask: Ethan wires data.
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft01Icon, QrCodeIcon, SparklesIcon, ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { Swap, Appear, GooSlider, SPRING } from "@/components/ui/motion";
import { DISHES, HALLS } from "./demo";

/* ── Live QR vote: moved to ./VoteScreen.tsx (real rounds, QR and live tallies) ── */
export { VoteScreen } from "./VoteScreen";

/* ── Onboarding: 4 questions ── */
const PLANS = ["Blue", "Gold", "Banana Slug", "Unlimited"];
const COLLEGES = ["Cowell", "Stevenson", "Crown", "Merrill", "Porter", "Kresge", "Oakes", "Rachel Carson", "College Nine", "John R. Lewis"];

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState("Gold");
  const [points, setPoints] = useState(1200);
  const [college, setCollege] = useState("Porter");
  const [hall, setHall] = useState("40");
  const steps = [
    { q: "Which meal plan are you on?", body: <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{PLANS.map((p) => <button key={p} type="button" className={`chip ${plan === p ? "on" : ""}`} onClick={() => setPlan(p)}>{p}</button>)}</div> },
    { q: "How many Slug Points do you have?", body: (
      <div className="card" style={{ display: "grid", gap: 6 }}>
        <div className="hero-num" style={{ fontSize: 40 }}><Swap id={String(points)}>{points.toLocaleString()}</Swap><small>pts</small></div>
        <GooSlider value={points} onChange={setPoints} min={0} max={2600} step={50} label="Slug Points" />
        <div className="label" style={{ fontSize: 12 }}>Check the GET app if you&apos;re not sure.</div>
      </div>
    ) },
    { q: "Which college are you in?", body: <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{COLLEGES.map((c) => <button key={c} type="button" className={`chip ${college === c ? "on" : ""}`} onClick={() => setCollege(c)}>{c}</button>)}</div> },
    { q: "Where do you usually eat?", body: <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{HALLS.map((h) => <button key={h.id} type="button" className={`chip ${hall === h.id ? "on" : ""}`} onClick={() => setHall(h.id)}>{h.short}</button>)}</div> },
  ];
  const done = step >= steps.length;
  return (
    <Screen noTabBar wash top={<div className="topbar">
        {step > 0 && !done ? <button type="button" className="iconbtn" aria-label="Back" onClick={() => setStep((s) => s - 1)}><Icon icon={ArrowLeft01Icon} size={18} /></button> : <span style={{ width: 38 }} />}
        <div style={{ display: "flex", gap: 6 }}>{steps.map((_, i) => <motion.span key={i} animate={{ width: i === step ? 22 : 7, background: i <= step ? "var(--p9)" : "var(--paper-2)" }} transition={SPRING} style={{ height: 7, borderRadius: 9, display: "block" }} />)}</div>
        <Link href="/" className="textbtn" style={{ fontSize: 13 }}>Skip</Link>
      </div>}>
{!done ? (
        <Appear id={step} style={{ display: "grid", gap: 18, marginTop: 24 }}>
          <h1 className="title-xl">{steps[step].q}</h1>
          {steps[step].body}
        </Appear>
      ) : (
        <Appear id="done" style={{ display: "grid", gap: 14, marginTop: 40, justifyItems: "center", textAlign: "center" }}>
          <span className="iconbtn" style={{ width: 72, height: 72, background: "var(--p9)", color: "white" }}><Icon icon={Tick02Icon} size={30} sw={2.4} /></span>
          <h1 className="title-xl">You&apos;re set</h1>
          <p className="body">{plan} plan · {points.toLocaleString()} points · {college}</p>
        </Appear>
      )}
      <div style={{ marginTop: "auto", paddingTop: 24 }}>
        {!done ? (
          <button type="button" className="btn btn-primary btn-block" onClick={() => setStep((s) => s + 1)}>Continue <Icon icon={ArrowRight01Icon} size={18} sw={2} /></button>
        ) : (
          <Link href="/" className="btn btn-primary btn-block">See what&apos;s good tonight</Link>
        )}
      </div>
    </Screen>
  );
}

/* ── Ask SlugGrub ── */
const SUGGESTIONS = ["High protein under 700 cal", "Best vegetarian tonight", "Something warm near Porter"];

export function AskScreen() {
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const ask = (text: string) => { if (text.trim()) setAsked(text.trim()); }; // TODO (Ethan): POST to /api/ask
  return (
    <Screen top={<div className="topbar">
        <Link href="/" className="iconbtn" aria-label="Back"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
        <span className="center">Ask SlugGrub</span>
        <span style={{ width: 38 }} />
      </div>}>
<h1 className="title-xl">What are you in the mood for?</h1>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} style={{ display: "flex", gap: 8 }}>
        <input id="ask" value={q} onChange={(e) => setQ(e.target.value)} placeholder="High protein under 700 cal" aria-label="Ask SlugGrub" style={{ flex: 1, height: 50, borderRadius: 999, border: 0, background: "var(--card)", padding: "0 18px", font: "inherit", fontSize: 15, color: "var(--ink)", outlineColor: "var(--p8)" }} />
        <button type="submit" className="iconbtn" style={{ width: 50, height: 50, background: "var(--p9)", color: "white" }} aria-label="Ask"><Icon icon={SparklesIcon} size={20} sw={1.9} /></button>
      </form>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SUGGESTIONS.map((s) => <button key={s} type="button" className="tint blue" onClick={() => { setQ(s); ask(s); }}>{s}</button>)}
      </div>
      {asked && (
        <Appear id={asked} style={{ display: "grid", gap: 10 }}>
          <div className="label">For &ldquo;{asked}&rdquo;, tonight</div>
          {["steak", "poke", "tikka"].map((id) => {
            const d = DISHES[id];
            return (
              <div className="card tight" key={id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Photo src={d.photo} w={56} h={56} r={12} />
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700 }}>{d.name}</div><div className="num label" style={{ fontSize: 12 }}>{d.hall} · {d.cal} cal · {d.protein}g protein</div></div>
              </div>
            );
          })}
        </Appear>
      )}
    </Screen>
  );
}

/* ── Dining services view: moved to ./DiningServicesScreen.tsx (stored votes and skips) ── */
export { DiningServicesScreen } from "./DiningServicesScreen";
