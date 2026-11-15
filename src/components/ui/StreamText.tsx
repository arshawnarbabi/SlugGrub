"use client";

// Owner: Arshawn. Smooth streamed text (his ask 2026-11-15: "smooth text streaming"). The pacing is ported from his own Chalk app
// (its streamdoc ticker): text arrives from the server in bursts, but words are released at a steady pace that follows the backlog,
// never a burst of many words in one frame and never a stall. One rAF ticker runs only while words wait; each released word fades
// and unblurs (2px, the state change's small-element blur, filter none at rest) on the standard curve. A word still arriving (no
// space after it yet) waits until it is whole, so a word never grows after it shows. Once everything has shown, the paragraph is
// plain text again. Reduced motion: no pacing, no fade, the text as it arrives.
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Chalk's pace, unchanged (words per ms): "never a burst of many words in one frame, never a stall".
export const PACE = {
  maxPerFrame: 3, // words per frame at most
  minRate: 0.012, // 12 words a second: the slowest it ever goes while words wait
  tailRate: 0.04, // 40 a second once the text is complete: the tail never crawls
  arrivalMs: 3000, // the source's own pace, averaged over this long, is the floor
  horizon: 300, // a backlog drains over about this long, so the rate follows it
  smooth: 300, // the rate eases toward its target, so a burst of tokens never jumps it
  hiddenMs: 400, // a frame gap this long means nobody watched (hidden tab): show everything at once
};
export const WORD_MS = 220; // motion.state_change.fade

interface Pace { shown: number; avail: number; final: boolean; rate: number; credit: number; lastT: number; raf: number; arrivals: { t: number; n: number }[] }

function arrivalRate(p: Pace, t: number) {
  while (p.arrivals.length && p.arrivals[0].t < t - PACE.arrivalMs) p.arrivals.shift();
  if (!p.arrivals.length) return 0;
  const n = p.arrivals.reduce((x, a) => x + a.n, 0) - p.arrivals[0].n; // the first arrival opens the window
  return n / Math.max(500, t - p.arrivals[0].t);
}

/** How many of the text's words are shown right now, released at Chalk's pace. */
function usePacedWords(text: string, final: boolean, paced: boolean) {
  const words = useMemo(() => text.match(/\s*\S+\s*/g) ?? [], [text]);
  const avail = final || /\s$/.test(text) ? words.length : Math.max(0, words.length - 1);
  const p = useRef<Pace>({ shown: 0, avail: 0, final: false, rate: 0, credit: 0, lastT: 0, raf: 0, arrivals: [] });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const s = p.current;
    const now = performance.now();
    if (avail > s.avail) s.arrivals.push({ t: now, n: avail - s.avail });
    s.avail = avail;
    s.final = final;
    if (!paced) { // reduced motion: StreamText draws the text as it arrives, no pacing
      s.shown = avail;
      return;
    }
    const tick = (t: number) => {
      s.raf = 0;
      const backlog = s.avail - s.shown;
      if (backlog <= 0) { s.lastT = 0; s.credit = 0; return; }
      const gap = s.lastT ? t - s.lastT : 0;
      if (gap > PACE.hiddenMs) {
        s.shown = s.avail;
        s.lastT = 0;
        setShown(s.shown);
        return;
      }
      const want = s.final ? Math.max(PACE.tailRate, backlog / PACE.horizon) : Math.max(PACE.minRate, arrivalRate(s, t), backlog / PACE.horizon);
      if (!s.lastT) {
        s.rate = want; // from rest: the first word shows on this frame
        s.credit = 1;
      } else {
        const dt = Math.min(gap, 50);
        s.rate += (want - s.rate) * (1 - Math.exp(-dt / PACE.smooth));
        s.credit = Math.min(PACE.maxPerFrame, s.credit + s.rate * dt);
      }
      s.lastT = t;
      const n = Math.min(Math.floor(s.credit), backlog, PACE.maxPerFrame);
      if (n > 0) {
        s.credit -= n;
        s.shown += n;
        setShown(s.shown);
      }
      if (s.shown < s.avail) s.raf = requestAnimationFrame(tick);
      else { s.lastT = 0; s.credit = 0; } // at rest until the next words, so a pause in the source never reads as a hidden tab
    };
    if (s.shown < s.avail && !s.raf) s.raf = requestAnimationFrame(tick);
  }, [avail, final, paced]);
  useEffect(() => {
    const s = p.current;
    return () => { cancelAnimationFrame(s.raf); s.raf = 0; };
  }, []);

  // settled: complete, all shown, and the last word's fade has run; then the paragraph is plain text again
  const [settled, setSettled] = useState(false);
  const done = final && shown >= words.length;
  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setSettled(true), WORD_MS + 60);
    return () => window.clearTimeout(id);
  }, [done]);
  return { words, shown, settled: done && settled };
}

export function StreamText({ text, final, className, style }: { text: string; final: boolean; className?: string; style?: React.CSSProperties }) {
  const reduce = !!useReducedMotion();
  const { words, shown, settled } = usePacedWords(text, final, !reduce);
  if (reduce || settled) return <p className={className} style={style}>{text}</p>;
  return (
    <p className={className} style={style} aria-busy={!final}>
      {words.slice(0, shown).map((w, i) => <span key={i} className="sw-word">{w}</span>)}
    </p>
  );
}
