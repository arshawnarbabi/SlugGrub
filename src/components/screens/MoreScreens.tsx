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

/* ── Live QR vote (judges vote, bars move) ── */
export function VoteScreen() {
  const [votes, setVotes] = useState({ a: 132, b: 82 });
  const [mine, setMine] = useState<"a" | "b" | null>(null);
  const reduce = useReducedMotion();
  const total = votes.a + votes.b;
  const pa = Math.round((votes.a / total) * 100);
  const vote = (k: "a" | "b") => { if (mine) return; setMine(k); setVotes((v) => ({ ...v, [k]: v[k] + 1 })); };
  const blk = (k: "a" | "b", id: string, p: number, tall: boolean) => {
    const d = DISHES[id];
    return (
      <button type="button" className="vote-blk press" style={{ minHeight: tall ? 210 : 160 }} onClick={() => vote(k)} aria-pressed={mine === k}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.photo} alt="" />
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 8 }}>
            <div><div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>{d.name}</div><div style={{ fontSize: 12, opacity: 0.85 }}>{d.hall}{mine === k ? " · your vote" : ""}</div></div>
            <div className="num" style={{ fontSize: tall ? 40 : 32, fontWeight: 700, letterSpacing: "-0.04em" }}><Swap id={String(p)}>{p}%</Swap></div>
          </div>
          <div className="bar"><motion.i initial={false} animate={{ width: `${p}%` }} transition={reduce ? { duration: 0 } : SPRING} /></div>
        </div>
      </button>
    );
  };
  return (
    <Screen noTabBar top={<div className="topbar">
        <Link href="/rank" className="iconbtn" aria-label="Back"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
        <span className="tint gold"><span className="dot" style={{ background: "var(--bad)" }} /> Live · <Swap id={String(total)}>{total}</Swap> votes</span>
        <span className="iconbtn" aria-hidden><Icon icon={QrCodeIcon} size={18} /></span>
      </div>}>
<h1 className="title-xl">Dish of the week</h1>
      <p className="body" style={{ marginTop: -6 }}>Final round. Tap the one you&apos;d rather eat.</p>
      {blk("a", "penne", pa, true)}
      {blk("b", "padthai", 100 - pa, false)}
      <div className="card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <QrMark />
        <div><b>Scan to vote</b><div className="label" style={{ fontSize: 12 }}>Point your camera at the code on screen. No app to install.</div></div>
      </div>
    </Screen>
  );
}

function QrMark() {
  // decorative QR-style mark for the mock; the real code comes from the deployed /vote URL
  const cells = [1,1,1,0,1,0,1,1,1, 1,0,1,0,0,1,1,0,1, 1,1,1,0,1,0,1,1,1, 0,0,0,1,0,1,0,0,0, 1,0,1,1,1,0,1,1,0, 0,1,0,0,1,1,0,1,0, 1,1,1,0,0,1,1,0,1, 1,0,1,1,0,0,0,1,1, 1,1,1,0,1,1,1,0,1];
  return (
    <svg width="64" height="64" viewBox="0 0 9 9" aria-hidden style={{ flex: "0 0 auto", borderRadius: 8, background: "white", padding: 4 }}>
      {cells.map((c, i) => c ? <rect key={i} x={i % 9} y={Math.floor(i / 9)} width="1" height="1" fill="var(--ink)" /> : null)}
    </svg>
  );
}

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
        <Appear key={step} style={{ display: "grid", gap: 18, marginTop: 24 }}>
          <h1 className="title-xl">{steps[step].q}</h1>
          {steps[step].body}
        </Appear>
      ) : (
        <Appear key="done" style={{ display: "grid", gap: 14, marginTop: 40, justifyItems: "center", textAlign: "center" }}>
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
        <Appear key={asked} style={{ display: "grid", gap: 10 }}>
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

/* ── Dining services view (startup pitch) ── */
export function DiningServicesScreen() {
  const loved = ["tikka", "poke", "penne"].map((id) => DISHES[id]);
  const skipped = [{ name: "Tofu Scramble", hall: "Carson/Oakes", n: 41 }, { name: "Beet Salad", hall: "Crown/Merrill", n: 33 }];
  return (
    <Screen noTabBar top={<div className="topbar">
        <Link href="/" className="iconbtn" aria-label="Back"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
        <span className="center">Dining services</span>
        <span style={{ width: 38 }} />
      </div>}>
<h1 className="title-xl">What students loved this week</h1>
      <div className="card" style={{ padding: "2px 14px" }}>
        {loved.map((d, i) => (
          <div className="row" key={d.id}>
            <span className="num" style={{ width: 16, fontWeight: 700, color: i === 0 ? "var(--y11)" : "var(--ink-3)" }}>{i + 1}</span>
            <Photo src={d.photo} w={44} h={44} r={12} />
            <div className="grow"><div className="title">{d.name}</div><div className="sub">{d.hall}</div></div>
            <span className="num" style={{ fontWeight: 700 }}>{d.score}</span>
          </div>
        ))}
      </div>
      <div className="sechead"><h2>Most skipped</h2></div>
      <div className="card" style={{ padding: "2px 14px" }}>
        {skipped.map((s) => (
          <div className="row" key={s.name}>
            <div className="grow"><div className="title">{s.name}</div><div className="sub">{s.hall}</div></div>
            <span className="label num" style={{ fontSize: 12 }}>lost {s.n} matchups</span>
          </div>
        ))}
      </div>
    </Screen>
  );
}
