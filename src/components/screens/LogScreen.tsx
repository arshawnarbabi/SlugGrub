"use client";

// Owner: Arshawn. Photo log: take or pick a plate photo, Gemini matches dishes (POST /api/log, demo result until it is built),
// adjust servings, save. Calories are private (PLAN.md design rule).
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft01Icon, Camera01Icon, FireIcon, Image01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { Swap, Appear, CountUp, GooSlider } from "@/components/ui/motion";
import { DISHES } from "./demo";

type Phase = "pick" | "reading" | "result" | "saved";
const FOUND = [{ id: "tikka", servings: 1.5 }, { id: "salad", servings: 1 }];

export function LogScreen() {
  const [phase, setPhase] = useState<Phase>("pick");
  const [photo, setPhoto] = useState<string>(DISHES.tikka.photo);
  const [servings, setServings] = useState<Record<string, number>>(Object.fromEntries(FOUND.map((f) => [f.id, f.servings])));
  const file = useRef<HTMLInputElement>(null);

  const start = (src: string) => {
    setPhoto(src);
    setPhase("reading");
    window.setTimeout(() => setPhase("result"), 1500); // TODO (Arshawn): POST the photo to /api/log and use its dishes
  };
  const items = FOUND.map((f) => ({ d: DISHES[f.id], s: servings[f.id] }));
  const cal = Math.round(items.reduce((n, x) => n + x.d.cal * x.s, 0));
  const mac = (k: "protein" | "carbs" | "fat") => Math.round(items.reduce((n, x) => n + x.d[k] * x.s, 0));

  return (
    <Screen>
      <div className="topbar">
        <Link href="/" className="iconbtn" aria-label="Back"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
        <span className="center">Log a plate</span>
        <span style={{ width: 38 }} />
      </div>

      {phase === "pick" && (
        <Appear style={{ display: "grid", gap: 14 }}>
          <div className="card" style={{ display: "grid", gap: 14, justifyItems: "center", textAlign: "center", padding: "28px 18px" }}>
            <span className="iconbtn" style={{ width: 64, height: 64, background: "var(--p3)", color: "var(--p9)" }}><Icon icon={Camera01Icon} size={28} sw={1.9} /></span>
            <div className="title-lg">Snap your tray</div>
            <p className="body" style={{ maxWidth: 280 }}>We match it to tonight&apos;s menu at your hall and use UCSC&apos;s own nutrition labels. Only you see your calories.</p>
          </div>
          <input ref={file} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) start(URL.createObjectURL(f)); }} />
          <button type="button" className="btn btn-primary btn-block" onClick={() => file.current?.click()}><Icon icon={Camera01Icon} size={19} sw={2} /> Take a photo</button>
          <button type="button" className="btn btn-secondary btn-block" onClick={() => start(DISHES.tikka.photo)}><Icon icon={Image01Icon} size={19} /> Use a demo plate</button>
        </Appear>
      )}

      {phase !== "pick" && (
        <Photo src={photo} h={200} r={24}>
          <span className="on-photo"><Swap id={phase === "reading" ? "r" : "d"}>{phase === "reading" ? "Reading your plate" : "Dinner · JRL/C9"}</Swap></span>
        </Photo>
      )}

      {phase === "reading" && (
        <Appear className="card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="iconbtn" style={{ width: 44, height: 44, background: "var(--paper-2)" }}><Icon icon={FireIcon} size={20} sw={2} /></span>
          <div><b>Matching to tonight&apos;s menu</b><div className="label" style={{ fontSize: 12 }}>Using the plate as a size guide</div></div>
        </Appear>
      )}

      {(phase === "result" || phase === "saved") && (
        <Appear style={{ display: "grid", gap: 12 }}>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="iconbtn" style={{ width: 44, height: 44, background: "var(--paper-2)" }}><Icon icon={FireIcon} size={20} sw={2} /></span>
            <div style={{ flex: 1 }}><div className="label">Calories · only you see this</div><div className="hero-num" style={{ fontSize: 38 }}><CountUp to={cal} /></div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {([["Protein", "protein", "var(--protein)"], ["Carbs", "carbs", "var(--carbs)"], ["Fat", "fat", "var(--fat)"]] as const).map(([n, k, c]) => (
              <div className="card tight" key={k}>
                <div className="label" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: 9, background: c }} />{n}</div>
                <div className="num" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}><Swap id={String(mac(k))}>{mac(k)}g</Swap></div>
              </div>
            ))}
          </div>
          {items.map(({ d, s }) => (
            <div className="card" key={d.id} style={{ display: "grid", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Photo src={d.photo} w={44} h={44} r={12} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
                  <div className="num label" style={{ fontSize: 12 }}><span style={{ color: "var(--p9)", fontWeight: 700 }}><Swap id={String(s)}>{s.toFixed(1)}</Swap> servings</span> · {Math.round(d.cal * s)} cal</div>
                </div>
              </div>
              <GooSlider value={s} onChange={(v) => setServings((m) => ({ ...m, [d.id]: v }))} label={`${d.name} servings`} />
            </div>
          ))}
          <div className="label" style={{ fontSize: 13 }}>Something look off? <button type="button" className="textbtn" style={{ color: "var(--p9)", padding: 0 }}>Fix it</button></div>
          <button type="button" className="btn btn-primary btn-block" onClick={() => setPhase("saved")} disabled={phase === "saved"}>
            <Swap id={phase}>{phase === "saved" ? <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Icon icon={Tick02Icon} size={18} sw={2.4} /> Saved to today</span> : <span>Save to today</span>}</Swap>
          </button>
        </Appear>
      )}
    </Screen>
  );
}
