"use client";

// Owner: Arshawn. Photo log: take or pick a plate photo, POST /api/log (Gemini matches it to this meal's menu), adjust servings,
// save. Calories are private (PLAN.md design rule): saved plates stay on this device (plates.ts). The hall is the student's
// usual hall from onboarding (JRL/C9 without a profile, or the first hall serving today when theirs is closed); the meal follows
// that hall's real hours today (src/lib/halls.ts), Pacific time. The demo plate is a dish on that meal's menu (src/components/screens/demoPlates.ts).
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Alert02Icon, ArrowLeft01Icon, Camera01Icon, FireIcon, Image01Icon, RiceBowl01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { Swap, Appear, CountUp, GooSlider, Seg, SPRING, STATE_IN, STATE_OUT, STATE_FADE } from "@/components/ui/motion";
import { HALLS } from "@/lib/halls";
import { useProfile } from "@/lib/profile";
import type { HallId, MealName } from "@/lib/types";
import type { LogItem, LogResponse, LogResult } from "@/app/api/log/contract";
import { dishPhoto } from "./dishPhoto";
import { portionText } from "./portion";
import { campusNow, hoursFor, mealLabel, mealToLog, MEAL_NAMES } from "./now";
import { savePlate } from "./plates";
import type { DemoPlates } from "./demoPlates";
import { ProcessingBeam } from "./ProcessingBeam";

type Phase = "pick" | "reading" | "result" | "saved" | "error";
const MEAL_OPTIONS = MEAL_NAMES.map(mealLabel);
const DEFAULT_HALL: HallId = "40";

export type { DemoPlates } from "./demoPlates";

// The hall and meal by the campus clock; read only in the browser (never during render on the server). The snapshot is one
// string so React can compare it between renders.
const noSubscribe = () => () => {};
function clockFor(usual: HallId): string {
  const now = campusNow(new Date());
  const open = (id: HallId) => hoursFor(id, now.date).length > 0;
  const hall = open(usual) ? usual : HALLS.find((h) => open(h.id))?.id ?? usual;
  return `${hall}|${mealToLog(hoursFor(hall, now.date), now.minutes)}|${now.date}`;
}

// Phone photos are 3 to 12 MB; a 1280px JPEG reads just as well and uploads in a moment. Falls back to the original file.
async function shrink(file: Blob): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext("2d")?.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close();
    const out = await new Promise<Blob | null>((ok) => c.toBlob(ok, "image/jpeg", 0.85));
    return out ?? file;
  } catch {
    return file;
  }
}

const fmt = (s: number) => String(Number(s.toFixed(2)));

export function LogScreen({ demo }: { demo: DemoPlates }) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [photo, setPhoto] = useState<string>("");
  const [picked, setPicked] = useState<MealName | null>(null);
  const profile = useProfile();
  const clock = useSyncExternalStore(noSubscribe, () => clockFor(profile?.usualHall ?? DEFAULT_HALL), () => null);
  const [hallId, auto, date] = (clock?.split("|") ?? []) as [HallId?, MealName?, string?];
  const HALL = HALLS.find((h) => h.id === hallId) ?? HALLS.find((h) => h.id === DEFAULT_HALL)!;
  const meal: MealName = picked ?? auto ?? "Dinner";
  const plate = demo[HALL.id]?.[meal];
  const [result, setResult] = useState<LogResult | null>(null);
  const [problem, setProblem] = useState("");
  const [servings, setServings] = useState<Record<string, number>>({});
  const [stored, setStored] = useState(true);
  const file = useRef<HTMLInputElement>(null);
  const run = useRef(0);
  const reduce = useReducedMotion();

  const send = async (blob: Blob, preview: string, menuDate?: string) => {
    const id = ++run.current;
    setPhoto(preview);
    setPhase("reading");
    try {
      const form = new FormData();
      form.append("photo", await shrink(blob), "plate.jpg");
      form.append("hall", HALL.id);
      form.append("meal", meal);
      form.append("date", menuDate ?? date ?? campusNow(new Date()).date);
      const res: LogResponse = await (await fetch("/api/log", { method: "POST", body: form })).json();
      if (id !== run.current) return; // the student started over meanwhile
      if (!res.ok) { setProblem(res.message); setPhase("error"); return; }
      setResult(res);
      setServings(Object.fromEntries(res.items.map((i) => [i.recipeId, i.servings])));
      setPhase("result");
    } catch {
      if (id !== run.current) return;
      setProblem("Couldn't reach SlugGrub. Check your connection and try again.");
      setPhase("error");
    }
  };
  const fromCamera = (f: File) => send(f, URL.createObjectURL(f));
  const fromDemo = async () => {
    if (!plate) return;
    try { send(await (await fetch(plate.photo)).blob(), plate.photo, plate.date); }
    catch { setProblem("Couldn't load the demo plate."); setPhase("error"); }
  };
  const again = () => { run.current++; setResult(null); setPhase("pick"); };

  const items = (result?.items ?? []).map((it) => ({ it, s: servings[it.recipeId] ?? it.servings }));
  const cal = Math.round(items.reduce((n, x) => n + x.it.per.calories * x.s, 0));
  const mac = (k: "proteinG" | "carbsG" | "fatG") => Math.round(items.reduce((n, x) => n + x.it.per[k] * x.s, 0));

  const save = () => {
    if (!result) return;
    const plate = items.map(({ it, s }) => ({ recipeId: it.recipeId, name: it.name, servings: s, calories: Math.round(it.per.calories * s) }));
    const at = new Date().toISOString();
    setStored(savePlate({ id: `${at}-${Math.random().toString(36).slice(2, 7)}`, at, hallId: result.hallId, meal: result.meal, items: plate, totalCalories: cal }));
    setPhase("saved");
  };

  const kind = phase === "reading" ? "reading" : phase === "error" ? "error" : "result";

  return (
    <>
    <Screen top={<div className="topbar">
        <Link href="/" className="iconbtn" aria-label="Back"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
        <span className="center">Log a plate</span>
        <span style={{ width: 44 }} />
      </div>}>

      {phase === "pick" && (
        <Appear style={{ display: "grid", gap: 14 }}>
          <div className="card" style={{ display: "grid", gap: 14, justifyItems: "center", textAlign: "center", padding: "28px 18px" }}>
            <span className="iconbtn" style={{ width: 64, height: 64, background: "var(--p3)", color: "var(--p9)" }}><Icon icon={Camera01Icon} size={28} sw={1.9} /></span>
            <div className="title-lg">Snap your tray</div>
            <p className="body" style={{ maxWidth: 280 }}>We match it to the {mealLabel(meal).toLowerCase()} menu at {HALL.short} and use UCSC&apos;s own nutrition labels. Only you see your calories.</p>
          </div>
          <Seg options={MEAL_OPTIONS} value={mealLabel(meal)} onChange={(v) => setPicked(MEAL_NAMES[MEAL_OPTIONS.indexOf(v)])} label="Meal" />
          <input ref={file} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) fromCamera(f); }} />
          <button type="button" className="btn btn-primary btn-block" onClick={() => file.current?.click()}><Icon icon={Camera01Icon} size={19} sw={2} /> Take a photo</button>
          {plate && <button type="button" className="btn btn-secondary btn-block" onClick={fromDemo}><Icon icon={Image01Icon} size={19} /> Use a demo plate</button>}
        </Appear>
      )}

      {phase !== "pick" && (
        <Photo src={photo} h={200} r={24} eager>
          <AnimatePresence>{phase === "reading" && <ProcessingBeam key="beam" radius={24} />}</AnimatePresence>
          <span className="on-photo"><Swap id={`${result?.meal ?? meal}${result?.hallShort ?? HALL.short}`}>{mealLabel(result?.meal ?? meal)} · {result?.hallShort ?? HALL.short}</Swap></span>
        </Photo>
      )}

      {/* The processing moment (his ask 2026-11-15): one card under the photo says what is happening while the beam rides the
          frame; when the answer comes it morphs on THE spring into the calorie card (or the error card), its icon chip staying put,
          and the rest of the stats fade in under it, in place. */}
      {phase !== "pick" && (kind !== "result" || result) && (
        <div style={{ display: "grid", gap: 12 }}>
          <motion.div layout={!reduce} layoutDependency={kind} transition={{ layout: SPRING }} className="card" style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 18 }}>
            <motion.span layout={reduce ? false : "position"} layoutDependency={kind} className="iconbtn" style={{ width: 44, height: 44, background: "var(--paper-2)" }}>
              <Swap id={kind === "error" ? "alert" : "fire"}><Icon icon={kind === "error" ? Alert02Icon : FireIcon} size={20} sw={2} /></Swap>
            </motion.span>
            <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={kind}
                  layout={reduce ? false : "position"}
                  layoutDependency={kind}
                  initial={reduce ? { opacity: 0 } : STATE_OUT}
                  animate={{ ...STATE_IN, transitionEnd: { filter: "none" } }}
                  exit={reduce ? { opacity: 0 } : STATE_OUT}
                  transition={reduce ? { duration: 0 } : STATE_FADE}
                >
                  {kind === "reading" && <Status meal={meal} />}
                  {kind === "error" && <><b>Couldn&apos;t log this plate</b><div className="label" style={{ fontSize: 13 }}>{problem}</div></>}
                  {kind === "result" && <><div className="label">Calories · only you see this</div><div className="hero-num" style={{ fontSize: 38 }}><CountUp to={cal} /></div></>}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <AnimatePresence initial={false}>
            {kind !== "reading" && (
              <motion.div key={kind} style={{ display: "grid", gap: 12 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={reduce ? { duration: 0 } : { duration: 0.24, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
                {kind === "error" && <button type="button" className="btn btn-primary btn-block" onClick={again}><Icon icon={Camera01Icon} size={19} sw={2} /> Try another photo</button>}
                {kind === "result" && result && <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {([["Protein", "proteinG", "var(--protein)"], ["Carbs", "carbsG", "var(--carbs)"], ["Fat", "fatG", "var(--fat)"]] as const).map(([n, k, c]) => (
                      <div className="card tight" key={k}>
                        <div className="label" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: 9, background: c }} />{n}</div>
                        <div className="num" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}><Swap id={String(mac(k))}>{mac(k)}g</Swap></div>
                      </div>
                    ))}
                  </div>
                  {items.map(({ it, s }) => <ItemCard key={it.recipeId} it={it} s={s} locked={phase === "saved"} onChange={(v) => setServings((m) => ({ ...m, [it.recipeId]: v }))} />)}
                  {result.notOnMenu.length > 0 && (
                    <div className="label" style={{ fontSize: 13 }}>Not on the {mealLabel(result.meal).toLowerCase()} menu, so not counted: {result.notOnMenu.join(", ")}</div>
                  )}
                  <div className="label" style={{ fontSize: 13 }}>Something look off? <button type="button" className="textbtn" style={{ color: "var(--p9)", padding: 0 }} onClick={again}>Retake</button></div>
                  <button type="button" className="btn btn-primary btn-block" onClick={save} disabled={phase === "saved"}>
                    <Swap id={phase}>{phase === "saved" ? <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Icon icon={Tick02Icon} size={18} sw={2.4} /> {stored ? "Saved to today" : "Couldn't save on this device"}</span> : <span>Save to today</span>}</Swap>
                  </button>
                </>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Screen>
    </>
  );
}

// What the photo log is doing while Gemini reads the plate: each step blur-fades into the next (a timer, not a loop) and the last
// one stays until the answer comes.
function Status({ meal }: { meal: MealName }) {
  const steps = ["Reading your plate…", `Matching it to the ${mealLabel(meal).toLowerCase()} menu…`, "Sizing up the portions…"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length - 1) return;
    const t = window.setTimeout(() => setI(i + 1), 1800);
    return () => window.clearTimeout(t);
  }, [i, steps.length]);
  return (
    <>
      <b style={{ display: "block" }}><Swap id={String(i)}>{steps[i]}</Swap></b>
      <div className="label" style={{ fontSize: 13 }}>Using the plate as a size guide</div>
    </>
  );
}

function ItemCard({ it, s, locked, onChange }: { it: LogItem; s: number; locked: boolean; onChange: (v: number) => void }) {
  const src = dishPhoto(it.name);
  return (
    <div className="card" style={{ display: "grid", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {src ? <Photo src={src} w={44} h={44} r={12} />
          : <span className="iconbtn" style={{ width: 44, height: 44, borderRadius: 12, background: "var(--paper-2)" }}><Icon icon={RiceBowl01Icon} size={20} /></span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{it.name}</div>
          <div className="num label" style={{ fontSize: 12 }}>
            <span style={{ color: "var(--p9)", fontWeight: 700 }}><Swap id={fmt(s)}>{fmt(s)}</Swap> × {portionText(it.portion) ?? "serving"}</span>
            {" · "}{it.noLabel ? "no label yet" : `${Math.round(it.per.calories * s)} cal`}{it.confidence === "low" ? " · rough guess" : ""}
          </div>
        </div>
      </div>
      {!locked && <GooSlider value={s} min={0.25} max={4} step={0.25} onChange={onChange} label={`${it.name} servings`} />}
    </div>
  );
}
