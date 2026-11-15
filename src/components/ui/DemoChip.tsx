"use client";

// Owner: Arshawn. "Demo data" chip (docs/DESIGN.md, "Demo data chip"): shown only while demo mode is on (src/lib/demoMode.ts), so
// mock rankings are never mistaken for real votes. Small Sidestash chip, information only (not a button).
import { useDemoMode } from "@/lib/demoMode";

export function DemoChip({ style }: { style?: React.CSSProperties }) {
  const on = useDemoMode();
  if (!on) return null;
  return <span className="demo-chip" style={style} title="Mock rankings for demos. Open any page with ?demo=0 to turn them off.">Demo data</span>;
}
