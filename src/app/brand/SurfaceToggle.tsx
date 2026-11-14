"use client";

// Owner: Arshawn. Brand kit only: flips the card surface style so the three options can be compared on the real screens.

import { useEffect, useState } from "react";

const OPTIONS = [
  { id: "flat", label: "Flat" },
  { id: "stroke", label: "Stroke" },
  { id: "both", label: "Stroke + shadow" },
] as const;
type Surface = (typeof OPTIONS)[number]["id"];

export function SurfaceToggle() {
  const [surface, setSurface] = useState<Surface>("flat");
  useEffect(() => {
    document.querySelector(".sg")?.setAttribute("data-surface", surface);
  }, [surface]);
  return (
    <div className="surface-toggle" role="radiogroup" aria-label="Card surface style">
      <span className="eyebrow">Cards</span>
      <div className="seg">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={surface === o.id} className={surface === o.id ? "on" : ""} onClick={() => setSurface(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
