"use client";

// Owner: Arshawn. Brand kit only: floating controls that flip the card surface style and the font on the real screens.

import { useEffect, useState } from "react";

const SURFACES = [
  { id: "sidestash-solid", label: "Sidestash, solid cards" },
  { id: "hybrid", label: "Flat + Sidestash" },
  { id: "sidestash", label: "Sidestash" },
  { id: "chalk", label: "Chalk" },
  { id: "flat", label: "Flat" },
  { id: "stroke", label: "Stroke" },
  { id: "both", label: "Stroke + shadow" },
] as const;
type Surface = (typeof SURFACES)[number]["id"];

const BACKGROUNDS = [
  { id: "0.994", label: "1 · White (Chalk)" },
  { id: "0.985", label: "2 · Near white" },
  { id: "0.977", label: "3 · Mist (Stroke)" },
  { id: "0.970", label: "4 · Light" },
  { id: "0.962", label: "5 · Flat (current)" },
  { id: "0.955", label: "6 · Soft gray" },
  { id: "0.948", label: "7 · Gray" },
  { id: "0.944", label: "8 · Sidestash" },
  { id: "0.938", label: "9 · Sidestash original" },
  { id: "0.930", label: "10 · Deeper gray" },
  { id: "0.920", label: "11 · Darkest" },
] as const;

const BLUES = [
  { id: "bright", label: "Bright" },
  { id: "ios", label: "iOS blue" },
  { id: "azure", label: "Azure" },
  { id: "cobalt", label: "Cobalt" },
  { id: "ocean", label: "Ocean" },
  { id: "navy", label: "UCSC navy" },
] as const;

export type FontOption = { id: string; label: string; css: string };

export function SurfaceToggle({ fonts, initialFont }: { fonts: FontOption[]; initialFont: string }) {
  const [surface, setSurface] = useState<Surface>("sidestash-solid");
  const [font, setFont] = useState(initialFont);
  const [blue, setBlue] = useState<string>("bright");
  const [bg, setBg] = useState<string>("0.962");

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".sg");
    if (!el) return;
    const L = parseFloat(bg);
    el.style.setProperty("--paper", `oklch(${L} 0.004 250)`);
    el.style.setProperty("--paper-2", `oklch(${(L - 0.032).toFixed(3)} 0.005 250)`);
  }, [bg]);

  useEffect(() => {
    document.querySelector(".sg")?.setAttribute("data-blue", blue);
  }, [blue]);

  useEffect(() => {
    const el = document.querySelector(".sg");
    if (!el) return;
    el.setAttribute("data-surface", surface === "sidestash-solid" ? "sidestash" : surface);
    if (surface === "sidestash-solid") el.setAttribute("data-cards", "solid");
    else el.removeAttribute("data-cards");
  }, [surface]);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".sg");
    const f = fonts.find((x) => x.id === font);
    if (el && f) {
      el.style.setProperty("--sans", f.css);
      el.style.setProperty("--display", f.css);
    }
  }, [font, fonts]);

  useEffect(() => {
    const onPick = (e: Event) => setFont((e as CustomEvent<string>).detail);
    window.addEventListener("sg-font", onPick);
    return () => window.removeEventListener("sg-font", onPick);
  }, []);

  return (
    <div className="surface-toggle">
      <span className="eyebrow">Cards</span>
      <div className="seg" role="radiogroup" aria-label="Card surface style">
        {SURFACES.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={surface === o.id} className={surface === o.id ? "on" : ""} onClick={() => setSurface(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
      <label className="eyebrow" htmlFor="sg-bg">Background</label>
      <select id="sg-bg" className="font-select" value={bg} onChange={(e) => setBg(e.target.value)}>
        {BACKGROUNDS.map((b) => (
          <option key={b.id} value={b.id}>{b.label}</option>
        ))}
      </select>
      <label className="eyebrow" htmlFor="sg-blue">Blue</label>
      <select id="sg-blue" className="font-select" value={blue} onChange={(e) => setBlue(e.target.value)}>
        {BLUES.map((b) => (
          <option key={b.id} value={b.id}>{b.label}</option>
        ))}
      </select>
      <label className="eyebrow" htmlFor="sg-font">Font</label>
      <select id="sg-font" className="font-select" value={font} onChange={(e) => setFont(e.target.value)}>
        {fonts.map((f) => (
          <option key={f.id} value={f.id}>{f.label}</option>
        ))}
      </select>
    </div>
  );
}

export function FontCard({ id, label, css, note }: FontOption & { note: string }) {
  return (
    <button type="button" className="card font-card" style={{ fontFamily: css }} onClick={() => window.dispatchEvent(new CustomEvent("sg-font", { detail: id }))}>
      <span className="fc-name">{label}</span>
      <span className="fc-title">Which was better?</span>
      <span className="fc-num">1,120 <small>pts</small> · 830 cal</span>
      <span className="fc-body">Shrimp Pad Thai moved up to #3 at JRL/C9.</span>
      <span className="fc-note">{note}</span>
      <span className="fc-apply">Tap to try it on every screen</span>
    </button>
  );
}
