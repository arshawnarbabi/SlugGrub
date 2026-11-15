"use client";

// Owner: Arshawn. Ask SlugGrub's action line (his ask 2026-11-15: an action line that says "actually what the model is doing", with a
// thinking orb). Ported from his own Chalk app's action line and restyled to docs/DESIGN.md:
//   - the orb for the current step, then the step's own words from the server (src/app/api/ask/contract.ts AskStepKind), then the
//     real time since the question was sent ("· 4s"), one line, cut with an ellipsis;
//   - a step, once shown, holds at least 600ms; steps inside the hold collapse to the newest (Chalk's rule: two steps 50ms apart
//     never flash), and each change blur-fades in place (Swap, THE state change) while the words box eases to its new width;
//   - a light sweep of blue runs across the words (Chalk's sweep: a masked band of the label's own text, transform only);
//   - at the end the orb and the time fade, the words become "Worked for 4s", hold 3 s, then the line leaves (onSettled).
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Swap } from "@/components/ui/motion";
import { ThinkingOrb, type OrbMode } from "@/components/ui/ThinkingOrb";
import type { AskStepKind } from "@/app/api/ask/contract";

export const LABEL_HOLD_MS = 600;
export const SETTLE_MS = 3000;
const SWEEP = { passMs: 2500, bandPx: 30, restMs: 255 }; // Chalk's: every pass 2.5 s whatever the label's length

const ORB_FOR: Record<AskStepKind, OrbMode> = {
  menus: "reading",
  halls: "searching",
  asking: "solving",
  thinking: "solving",
  writing: "composing",
  matching: "working",
};

export function fmtElapsed(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

/** The words the line shows: a step, once shown, holds at least LABEL_HOLD_MS, and steps inside the hold collapse to the newest.
 *  "end" (the answer is complete) never swallows the last step: a step that has not shown yet (matching, which takes a moment)
 *  gets its hold first, then the line ends. */
function useLineWords(stepKey: string, ended: boolean) {
  const [shown, setShown] = useState(stepKey);
  const last = useRef(0);
  const target = ended ? "end" : stepKey;
  useEffect(() => {
    if (shown === target) return;
    const next = ended && shown !== stepKey ? stepKey : target;
    const wait = Math.max(0, LABEL_HOLD_MS - (performance.now() - last.current));
    const id = window.setTimeout(() => {
      last.current = performance.now();
      setShown(next);
    }, wait);
    return () => window.clearTimeout(id);
  }, [shown, target, stepKey, ended]);
  return shown;
}

function useElapsed(since: number, on: boolean) {
  const [now, setNow] = useState(since);
  useEffect(() => {
    if (!on) return;
    let id = 0;
    const step = () => {
      setNow(Date.now());
      id = window.setTimeout(step, 1000 - ((Date.now() - since) % 1000) + 4);
    };
    step();
    return () => window.clearTimeout(id);
  }, [since, on]);
  return Math.max(0, now - since);
}

/** The light sweep: a band of the label's own text in blue glides across it; only transform animates. */
function Sweep({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const copy = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current, c = copy.current;
    if (!el || !c) return;
    const w = Math.min(c.offsetWidth, el.clientWidth); // a cut label sweeps only what shows
    const speed = (SWEEP.bandPx + w) / ((SWEEP.passMs - SWEEP.restMs) / 1000);
    el.style.setProperty("--sw-to", `${Math.round(w + (speed * SWEEP.restMs) / 1000)}px`);
    el.style.setProperty("--sw-dur", `${SWEEP.passMs}ms`);
  }, [text]);
  return (
    <span className="sweep" ref={ref}>
      {text}
      <span className="sw-win" aria-hidden="true"><span ref={copy}>{text}</span></span>
    </span>
  );
}

export function AskActionLine({ step, startedAt, endedAt, onSettled }: { step: { kind: AskStepKind; text: string } | null; startedAt: number; endedAt: number | null; onSettled?: () => void }) {
  const line = useLineWords(step ? `${step.kind}|${step.text}` : "asking|Asking SlugGrub", endedAt !== null);
  const ended = line === "end" && endedAt !== null;
  const [kind, words] = line.split("|") as [AskStepKind, string];
  const elapsed = useElapsed(startedAt, !ended);
  const shown = ended ? `Worked for ${fmtElapsed(Math.max(1000, endedAt - startedAt))}` : words;

  // Chalk's change: the new words blur-fade in over the old ones (Swap) while the words box eases to the new width on the standard
  // curve, so the time beside it glides along instead of jumping (one short row; contain keeps the reflow inside it)
  const box = useRef<HTMLSpanElement>(null);
  const meas = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (box.current && meas.current) box.current.style.width = `${Math.ceil(meas.current.getBoundingClientRect().width)}px`;
  }, [shown]);

  // at the end the orb's slot closes and it fades; once gone its animations leave the page
  const [orbGone, setOrbGone] = useState(false);
  useEffect(() => {
    if (!ended) return;
    const gone = window.setTimeout(() => setOrbGone(true), 300);
    const settle = window.setTimeout(() => onSettled?.(), SETTLE_MS);
    return () => { window.clearTimeout(gone); window.clearTimeout(settle); };
  }, [ended, onSettled]);

  return (
    <div className={ended ? "action-line ended" : "action-line"}>
      <span className="al-orb" aria-hidden={ended || undefined}>{!orbGone && <ThinkingOrb mode={ORB_FOR[kind] ?? "solving"} size={20} label={words} />}</span>
      <span className="al-words" ref={box} aria-live="polite">
        <Swap id={shown} style={{ minWidth: 0, maxWidth: "100%" }}>{ended ? <span className="al-done">{shown}</span> : <Sweep text={shown} />}</Swap>
        <span className="al-meas" ref={meas} aria-hidden="true">{shown}</span>
      </span>
      <span className="al-time" aria-hidden="true">· {fmtElapsed(elapsed)}</span>
    </div>
  );
}
