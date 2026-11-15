"use client";

// Owner: Arshawn. "Demo data" chip (docs/DESIGN.md, "Demo data chip"): shown only while demo mode is on (src/lib/demoMode.ts), so
// mock rankings are never mistaken for real votes. Information only (not a button). 2026-11-15 (his demo mode button, for judges):
// raised from the quiet ink-2 chip to the blue tint with a solid dot, so it reads at a glance on every ranking screen and Today.
import { useDemoMode } from "@/lib/demoMode";
import "./demo-chip.css";

export function DemoChip({ style }: { style?: React.CSSProperties }) {
  const on = useDemoMode();
  if (!on) return null;
  return <span className="demo-chip demo-chip-on" style={style} title="Mock rankings for demos. Leave demo in Settings (the profile button on Today).">Demo data</span>;
}
