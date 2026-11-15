"use client";

// Owner: Arshawn (UI; moved out of MoreScreens.tsx with its look unchanged). Wired by the menus code: plan, points, college and
// usual hall are saved on this device (src/lib/profile.ts, key "sluggrub.profile"); Google sign-in (src/lib/auth.ts) is optional
// and the screen works signed out.
// Step 5 (2026-11-15, his ask and his pick of the "optional step" design): an optional daily calorie goal from height, weight, age,
// sex and activity (src/lib/calorieGoal.ts), or a number they type. Skippable; it stays in the profile on this phone, never sent
// anywhere and never shown to anyone else (calories are private, taste is social). Today's "Set a goal" opens just this step
// (?step=4&goal=1), which saves only the goal and returns to Today.
// Split in two (2026-11-15, his ask: "for the calorie goal you also have to ask if they want to gain weight or lose wieight or maintain.
// and lets try to make this into 2 onboaring screens so it fis better"): step 5 "About you" (height, weight, age, sex), step 6 "Your
// goal" (activity, lose / maintain / gain, the number). Skip on either means no goal; ?step=4&goal=1 opens the first of the two.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { preload } from "react-dom";
import { PlanArt, PointsArt, CollegeArt, HallArt, BodyArt, GoalArt } from "./OnboardArt";
import { ArrowLeft01Icon, ArrowRight01Icon, Tick02Icon, GoogleIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { Swap, Appear, GooSlider, Seg } from "@/components/ui/motion";
import { HALLS, MEAL_PLANS } from "@/lib/halls";
import { getProfile, goalCalories, saveGoal, saveProfile, type CalorieGoal } from "@/lib/profile";
import { ACTIVITY, DIRECTION, goalFromBody, type Activity, type Direction, type Sex } from "@/lib/calorieGoal";
import { signInWithGoogle } from "@/lib/auth";
import { demoOn } from "@/lib/demoMode";
import type { College, HallId, MealPlanId } from "@/lib/types";

const COLLEGES: College[] = ["Cowell", "Stevenson", "Crown", "Merrill", "Porter", "Kresge", "Oakes", "Rachel Carson", "College Nine", "John R. Lewis"];
const hallOf = (c: College): HallId => HALLS.find((h) => h.colleges.includes(c))?.id ?? "40";
const SEXES: [Sex, string][] = [["male", "Male"], ["female", "Female"], ["unsaid", "Rather not say"]];
const ACTS = Object.keys(ACTIVITY) as Activity[];
const ACT_LABELS = ACTS.map((a) => ACTIVITY[a].label);
const DIRS = Object.keys(DIRECTION) as Direction[];
const DIR_LABELS = DIRS.map((d) => DIRECTION[d].label);
const GOAL_STEP = 4; // "About you"; the goal itself is the step after it, the last one
/** The body answers as typed (strings, so a field can be empty). */
interface Body { ft: string; inch: string; lb: string; age: string; sex: Sex | null; activity: Activity; direction: Direction }
const NO_BODY: Body = { ft: "", inch: "", lb: "", age: "", sex: null, activity: "moderate", direction: "maintain" };
// Start demo's example (5'10", 160 lb, 19, moderately active, maintain: 2,710 a day), so a demo ends with the ring on Today
const DEMO_BODY: Body = { ft: "5", inch: "10", lb: "160", age: "19", sex: "male", activity: "moderate", direction: "maintain" };
const num = (v: string) => (v.trim() === "" ? undefined : Number(v));
const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

export function OnboardingScreen() {
  const router = useRouter();
  // the hall step's five photos (public/halls, about 390KB in all) load with the page, so the photo is there when the step opens and
  // switching halls never flashes an empty tile
  HALLS.forEach((h) => preload(`/halls/${h.id}.jpg`, { as: "image", fetchPriority: "low" }));
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<MealPlanId>("gold");
  const [points, setPoints] = useState(1200);
  const [college, setCollege] = useState<College>("Porter");
  const [hall, setHall] = useState<HallId>("25");
  const [hallPicked, setHallPicked] = useState(false); // until they pick a hall, it follows their college
  const [google, setGoogle] = useState<"idle" | "busy" | "done" | "off">("idle");
  const [who, setWho] = useState<{ name?: string; uid?: string }>({});
  const [body, setBody] = useState<Body>(NO_BODY);
  const [typed, setTyped] = useState<string | null>(null); // their own goal, when they typed one (null: the formula's)
  const [goalOnly, setGoalOnly] = useState(false); // opened from Today's "Set a goal": this step only, then back to Today
  // editing (Settings: "Edit my plan, college and hall"): start from what this device already saved. With nothing saved (first run, or
  // Settings' "Start demo" just cleared it) start from the defaults, since Next keeps this route's state from an earlier visit.
  useEffect(() => {
    const p = getProfile();
    if (!p) {
      setPlan("gold"); setPoints(1200); setCollege("Porter"); setHall("25"); setHallPicked(false); setWho({}); setGoogle("idle");
      setBody(demoOn() ? DEMO_BODY : NO_BODY); setTyped(null);
      return;
    }
    setPlan(p.plan); setPoints(p.pointsNow); setCollege(p.college); setHall(p.usualHall); setHallPicked(true);
    const g = p.goal;
    setBody(g ? {
      ft: g.heightIn ? String(Math.floor(g.heightIn / 12)) : "", inch: g.heightIn ? String(g.heightIn % 12) : "",
      lb: g.weightLb ? String(g.weightLb) : "", age: g.age ? String(g.age) : "", sex: g.sex ?? null, activity: g.activity ?? "moderate",
      direction: g.direction ?? "maintain",
    } : demoOn() ? DEMO_BODY : NO_BODY);
    setTyped(g?.typed ? String(g.calories) : null);
    if (p.uid) { setWho({ name: p.name, uid: p.uid }); setGoogle("done"); }
  }, []);
  // ?step=N opens on that question: Budget's "Update points" (step 1) and the review page (public/dev/review.html). Read on every
  // arrival, so a visit without it starts at the first question even though Next keeps this route's state between visits.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const n = Number(q.get("step"));
    setStep(Number.isInteger(n) && n > 0 ? n : 0);
    setGoalOnly(q.get("goal") === "1" && !!getProfile());
  }, []);
  const total = MEAL_PLANS.find((p) => p.id === plan)?.pointsPerQuarter ?? 2037;
  const max = Math.ceil(Math.max(total, points) / 50) * 50;
  const planLabel = MEAL_PLANS.find((p) => p.id === plan)?.label ?? "Gold";
  const heightIn = num(body.ft) !== undefined ? (num(body.ft) ?? 0) * 12 + (num(body.inch) ?? 0) : undefined;
  const formula = goalFromBody({ heightIn, weightLb: num(body.lb), age: num(body.age), sex: body.sex ?? undefined, activity: body.activity, direction: body.direction });
  const typedN = typed !== null ? num(typed) : undefined;
  const goal = typed !== null ? (typedN && typedN >= 800 && typedN <= 8000 ? Math.round(typedN) : null) : formula;
  const goalRecord = (): CalorieGoal | undefined => goal ? {
    calories: goal, heightIn, weightLb: num(body.lb), age: num(body.age), sex: body.sex ?? undefined, activity: body.activity, direction: body.direction, typed: typed !== null || undefined,
  } : undefined;
  // a body answer changed: the formula's number takes over again
  const setB = (patch: Partial<Body>) => { setBody((b) => ({ ...b, ...patch })); setTyped(null); };
  const steps = [
    { art: <PlanArt plan={plan} />, q: "Which meal plan are you on?", body: <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{MEAL_PLANS.map((p) => <button key={p.id} type="button" className={`chip ${plan === p.id ? "on" : ""}`} onClick={() => { setPlan(p.id); setPoints((v) => Math.min(v, p.pointsPerQuarter)); }}>{p.label}</button>)}</div> },
    { art: <PointsArt points={points} total={total} />, q: "How many Slug Points do you have?", body: (
      <div className="card" style={{ display: "grid", gap: 6 }}>
        <GooSlider value={points} onChange={setPoints} min={0} max={max} step={plan === "unlimited" ? 5 : 10} label="Slug Points" />
        <div className="label" style={{ fontSize: 12 }}>{planLabel} starts each quarter with {total.toLocaleString()}. Check the GET app if you&apos;re not sure.</div>
      </div>
    ) },
    { art: <CollegeArt college={college} />, q: "Which college are you in?", body: <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{COLLEGES.map((c) => <button key={c} type="button" className={`chip ${college === c ? "on" : ""}`} onClick={() => { setCollege(c); if (!hallPicked) setHall(hallOf(c)); }}>{c}</button>)}</div> },
    { art: <HallArt hall={hall} />, q: "Where do you usually eat?", body: <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{HALLS.map((h) => <button key={h.id} type="button" className={`chip ${hall === h.id ? "on" : ""}`} onClick={() => { setHall(h.id); setHallPicked(true); }}>{h.short}</button>)}</div> },
    { art: <BodyArt ft={body.ft} inch={body.inch} lb={body.lb} age={body.age} sex={body.sex} />, q: "About you", body: (
      <div style={{ display: "grid", gap: 14 }}>
        <p className="body" style={{ margin: 0 }}>Optional, for a daily calorie goal from a standard formula. Skip it to just see what you eat.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.15fr 1fr", gap: 8, alignItems: "end" }}>
          <NumField label="Height" suffix="ft" value={body.ft} onChange={(v) => setB({ ft: digits(v, 1) })} />
          <NumField label=" " suffix="in" value={body.inch} onChange={(v) => { const d = digits(v, 2); setB({ inch: d === "" ? "" : String(Math.min(11, Number(d))) }); }} aria="Height, inches" />
          <NumField label="Weight" suffix="lb" value={body.lb} onChange={(v) => setB({ lb: digits(v, 3) })} />
          <NumField label="Age" value={body.age} onChange={(v) => setB({ age: digits(v, 2) })} />
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <div className="label" style={{ fontSize: 12 }}>Sex, used only for the formula</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{SEXES.map(([k, l]) => <button key={k} type="button" className={`chip chip-sm ${body.sex === k ? "on" : ""}`} onClick={() => setB({ sex: k })}>{l}</button>)}</div>
        </div>
        <div className="label" style={{ fontSize: 12 }}>Stays on this phone. Nobody else ever sees it.</div>
      </div>
    ) },
    { art: <GoalArt goal={goal} />, q: "Your goal", body: (
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <Seg options={ACT_LABELS} value={ACTIVITY[body.activity].label} onChange={(v) => setB({ activity: ACTS[ACT_LABELS.indexOf(v)] })} label="How active are you" />
          <div className="label" style={{ fontSize: 12 }}><Swap id={body.activity}>{ACTIVITY[body.activity].sub}</Swap></div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <Seg options={DIR_LABELS} value={DIRECTION[body.direction].label} onChange={(v) => setB({ direction: DIRS[DIR_LABELS.indexOf(v)] })} label="What you want your eating to do" />
          <div className="label" style={{ fontSize: 12 }}><Swap id={body.direction}>{DIRECTION[body.direction].sub}</Swap></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 132, flex: "none" }}><NumField value={typed ?? (formula ? String(formula) : "")} suffix="cal" onChange={(v) => setTyped(digits(v, 4))} aria="Daily goal, calories" /></div>
          <div className="label" style={{ fontSize: 12 }}><Swap id={typed !== null ? "own" : formula ? "calc" : "none"}>{typed !== null ? "Your own number" : formula ? "Your goal a day. Change it if you like" : "Fill in About you, or type your own goal"}</Swap></div>
        </div>
      </div>
    ) },
  ];
  const done = step >= steps.length;
  const savedGoal = done ? goalCalories(getProfile()) : null;
  // the points keep the day they were entered unless they changed, so editing the goal or college never resets Budget's visit charges
  const save = (extra: { name?: string; uid?: string } = who, g: CalorieGoal | undefined = goalRecord()) => {
    const was = getProfile();
    const savedAt = was && was.pointsNow === points && was.plan === plan ? was.savedAt : undefined;
    return saveProfile({ plan, pointsNow: points, college, usualHall: hall, ...extra, goal: g, savedAt });
  };
  // finishing never logs a plate, demo or not (his ask 2026-11-15: "have it not log a plate as soon as onboarding is finished"): Today
  // opens with an empty calorie ring that shows the goal
  const finish = (g: CalorieGoal | undefined) => {
    if (goalOnly) { saveGoal(g); router.replace("/"); return; }
    save(who, g);
    setStep(steps.length);
  };
  const LAST = steps.length - 1; // the goal number; GOAL_STEP is the "About you" step before it
  const inGoal = step >= GOAL_STEP && !done;
  const next = () => {
    if (step === LAST) { finish(goalRecord()); return; }
    setStep((s) => s + 1);
  };
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
        {step > 0 && !done && (!goalOnly || step > GOAL_STEP) ? <button type="button" className="iconbtn" aria-label="Back" onClick={() => setStep((s) => s - 1)}><Icon icon={ArrowLeft01Icon} size={18} /></button> : <span style={{ width: 38 }} />}
        {/* step dots, drawn at their place from the first paint with CSS (.step-dot): the framer version rendered with no width and no
            fill until its spring ran, so a step opened by link or a frozen capture showed none or the wrong one (his review 2026-11-14, S13) */}
        <div role="img" style={{ display: "flex", gap: 6 }} aria-label={`Step ${Math.min(step, steps.length - 1) + 1} of ${steps.length}`}>{steps.map((_, i) => <span key={i} className={`step-dot ${i === step ? "now" : ""} ${i <= step ? "done" : ""}`} />)}</div>
        {/* on either goal step, Skip means "no goal" (and finishes); on the others it leaves without saving, as before. Opened for the goal
            alone (Today, Settings), Skip leaves without changing the saved goal */}
        {inGoal
          ? <button type="button" className="textbtn" style={{ fontSize: 13 }} onClick={() => (goalOnly ? router.replace("/") : finish(undefined))}>Skip</button>
          : <Link href="/" replace className="textbtn" style={{ fontSize: 13 }}>Skip</Link>}
      </div>}>
{!done ? (
        // the step fills the screen: illustration, question and answers spread down it instead of stacking at the top
        <Appear id={step} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, paddingTop: 8 }}>
          {steps[step].art}
          <h1 className="title-xl">{steps[step].q}</h1>
          {steps[step].body}
        </Appear>
      ) : (
        <Appear id="done" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 14, textAlign: "center" }}>
          <span className="iconbtn" style={{ width: 72, height: 72, background: "var(--p9)", color: "white" }}><Icon icon={Tick02Icon} size={30} sw={2.4} /></span>
          <h1 className="title-xl">{who.name ? `You're set, ${who.name.split(" ")[0]}` : "You're set"}</h1>
          <p className="body">{planLabel} plan · {points.toLocaleString()} points · {college}</p>
          <p className="label" style={{ fontSize: 13, margin: 0 }}>{savedGoal ? `Daily goal ${savedGoal.toLocaleString("en-US")} cal · only you see it` : "No calorie goal. Add one any time from Today."}</p>
          <p className="label" style={{ fontSize: 12, maxWidth: 280 }}>
            Saved on this phone only. <Swap id={google}>{google === "done" ? "Signed in with Google." : google === "off" ? "Google sign-in isn't available right now. Everything works without it." : "Google sign-in is optional."}</Swap>
          </p>
        </Appear>
      )}
      <div style={{ marginTop: "auto", paddingTop: 24, display: "grid", gap: 10 }}>
        {!done ? (
          <button type="button" className="btn btn-primary btn-block raised" onClick={next}>
            <Swap id={step === LAST && !goal ? "none" : "go"}>{step === LAST && !goal ? "Continue without a goal" : <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{step === LAST && goalOnly ? "Save goal" : "Continue"} <Icon icon={ArrowRight01Icon} size={18} sw={2} /></span>}</Swap>
          </button>
        ) : (
          <>
            {google !== "done" && google !== "off" && (
              <button type="button" className="btn btn-secondary btn-block raised" onClick={withGoogle} disabled={google === "busy"}><Icon icon={GoogleIcon} size={18} sw={2} /> Continue with Google</button>
            )}
            <Link href="/" replace className="btn btn-primary btn-block raised">See what&apos;s good tonight</Link>
          </>
        )}
      </div>
    </Screen>
  );
}

/** A number field on the page color (inputs are --card white): an optional label above, the unit inside on the right. */
function NumField({ label, suffix, value, onChange, aria }: { label?: string; suffix?: string; value: string; onChange: (v: string) => void; aria?: string }) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
      {label !== undefined && <span className="label" style={{ fontSize: 12, whiteSpace: "pre" }}>{label}</span>}
      <span style={{ position: "relative", display: "block" }}>
        <input className="input num" inputMode="numeric" pattern="[0-9]*" value={value} aria-label={aria ?? label} onChange={(e) => onChange(e.target.value)}
          style={{ padding: suffix ? "0 30px 0 14px" : "0 14px", fontWeight: 600 }} />
        {suffix && <span className="label" aria-hidden style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, pointerEvents: "none" }}>{suffix}</span>}
      </span>
    </label>
  );
}
