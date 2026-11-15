"use client";

// Owner: Arshawn (UI; moved out of MoreScreens.tsx with its look unchanged). Wired by the menus code: plan, points, college and
// usual hall are saved on this device (src/lib/profile.ts, key "sluggrub.profile"); Google sign-in (src/lib/auth.ts) is optional
// and the screen works signed out.
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft01Icon, ArrowRight01Icon, Tick02Icon, GoogleIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { Swap, Appear, GooSlider, SPRING } from "@/components/ui/motion";
import { HALLS, MEAL_PLANS } from "@/lib/halls";
import { getProfile, saveProfile } from "@/lib/profile";
import { signInWithGoogle } from "@/lib/auth";
import type { College, HallId, MealPlanId } from "@/lib/types";

const COLLEGES: College[] = ["Cowell", "Stevenson", "Crown", "Merrill", "Porter", "Kresge", "Oakes", "Rachel Carson", "College Nine", "John R. Lewis"];
const hallOf = (c: College): HallId => HALLS.find((h) => h.colleges.includes(c))?.id ?? "40";

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<MealPlanId>("gold");
  const [points, setPoints] = useState(1200);
  const [college, setCollege] = useState<College>("Porter");
  const [hall, setHall] = useState<HallId>("25");
  const [hallPicked, setHallPicked] = useState(false); // until they pick a hall, it follows their college
  const [google, setGoogle] = useState<"idle" | "busy" | "done" | "off">("idle");
  const [who, setWho] = useState<{ name?: string; uid?: string }>({});
  // editing: start from what this device already saved
  useEffect(() => {
    const p = getProfile();
    if (!p) return;
    setPlan(p.plan); setPoints(p.pointsNow); setCollege(p.college); setHall(p.usualHall); setHallPicked(true);
    if (p.uid) { setWho({ name: p.name, uid: p.uid }); setGoogle("done"); }
  }, []);
  const total = MEAL_PLANS.find((p) => p.id === plan)?.pointsPerQuarter ?? 2037;
  const max = Math.ceil(Math.max(total, points) / 50) * 50;
  const planLabel = MEAL_PLANS.find((p) => p.id === plan)?.label ?? "Gold";
  const steps = [
    { q: "Which meal plan are you on?", body: <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{MEAL_PLANS.map((p) => <button key={p.id} type="button" className={`chip ${plan === p.id ? "on" : ""}`} onClick={() => { setPlan(p.id); setPoints((v) => Math.min(v, p.pointsPerQuarter)); }}>{p.label}</button>)}</div> },
    { q: "How many Slug Points do you have?", body: (
      <div className="card" style={{ display: "grid", gap: 6 }}>
        <div className="hero-num" style={{ fontSize: 40 }}><Swap id={String(points)}>{points.toLocaleString()}</Swap><small>pts</small></div>
        <GooSlider value={points} onChange={setPoints} min={0} max={max} step={plan === "unlimited" ? 5 : 10} label="Slug Points" />
        <div className="label" style={{ fontSize: 12 }}>{planLabel} starts each quarter with {total.toLocaleString()}. Check the GET app if you&apos;re not sure.</div>
      </div>
    ) },
    { q: "Which college are you in?", body: <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{COLLEGES.map((c) => <button key={c} type="button" className={`chip ${college === c ? "on" : ""}`} onClick={() => { setCollege(c); if (!hallPicked) setHall(hallOf(c)); }}>{c}</button>)}</div> },
    { q: "Where do you usually eat?", body: <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{HALLS.map((h) => <button key={h.id} type="button" className={`chip ${hall === h.id ? "on" : ""}`} onClick={() => { setHall(h.id); setHallPicked(true); }}>{h.short}</button>)}</div> },
  ];
  const done = step >= steps.length;
  const save = (extra: { name?: string; uid?: string } = who) => saveProfile({ plan, pointsNow: points, college, usualHall: hall, ...extra });
  const next = () => { if (step === steps.length - 1) save(); setStep((s) => s + 1); };
  const withGoogle = async () => {
    setGoogle("busy");
    try {
      const u = await signInWithGoogle();
      if (!u) { setGoogle("off"); return; }
      const extra = { name: u.name ?? undefined, uid: u.uid };
      setWho(extra); save(extra); setGoogle("done");
    } catch {
      setGoogle("off");
    }
  };
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
          <h1 className="title-xl">{who.name ? `You're set, ${who.name.split(" ")[0]}` : "You're set"}</h1>
          <p className="body">{planLabel} plan · {points.toLocaleString()} points · {college}</p>
          <p className="label" style={{ fontSize: 12, maxWidth: 280 }}>
            Saved on this phone only. <Swap id={google}>{google === "done" ? "Signed in with Google." : google === "off" ? "Google sign-in isn't available right now. Everything works without it." : "Google sign-in is optional."}</Swap>
          </p>
        </Appear>
      )}
      <div style={{ marginTop: "auto", paddingTop: 24, display: "grid", gap: 10 }}>
        {!done ? (
          <button type="button" className="btn btn-primary btn-block" onClick={next}>Continue <Icon icon={ArrowRight01Icon} size={18} sw={2} /></button>
        ) : (
          <>
            {google !== "done" && google !== "off" && (
              <button type="button" className="btn btn-secondary btn-block" onClick={withGoogle} disabled={google === "busy"}><Icon icon={GoogleIcon} size={18} sw={2} /> Continue with Google</button>
            )}
            <Link href="/" className="btn btn-primary btn-block">See what&apos;s good tonight</Link>
          </>
        )}
      </div>
    </Screen>
  );
}
