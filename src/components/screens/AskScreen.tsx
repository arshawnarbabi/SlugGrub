"use client";

// Owner: Arshawn (UI; moved out of MoreScreens.tsx with its look unchanged). Wired by the menus code to /api/ask
// (src/app/api/ask/contract.ts): Gemini picks from the meal each hall is serving now; calories come from the UCSC labels.
// Layout (his review 2026-11-14): title and answers on top, suggestions and the Sidestash prompt bar at the bottom, above the nav bar.
// Streaming (his ask 2026-11-15, after his Chalk app): while Gemini works, the thinking orb and the action line say what is actually
// happening (each step comes from the server, AskActionLine.tsx), the answer streams in at Chalk's pace (StreamText.tsx), and the
// picks blur-fade in on THE spring. When the answer is complete the orb fades, "Worked for 4s" holds, then the line leaves and
// the answer glides up into its place.
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft01Icon, ArrowUp02Icon, RiceBowl01Icon, Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { Appear, SPRING } from "@/components/ui/motion";
import { StreamText } from "@/components/ui/StreamText";
import { ASK_MAX_CHARS, ASK_STREAM_TYPE, type AskEvent, type AskPick, type AskResponse, type AskResult, type AskStepKind } from "@/app/api/ask/contract";
import { AskActionLine } from "./AskActionLine";
import { dishPhoto } from "./dishPhoto";
import { portionText } from "./portion";
import "./ask.css";

const SUGGESTIONS = ["High protein under 700 cal", "Best vegetarian right now", "Something warm near Porter"];
const NO_REACH = "Couldn't reach SlugGrub. Check your connection and try again.";
const CUT_OFF = "Gemini couldn't answer right now. Try again in a moment.";

interface Run {
  id: number;
  q: string;
  t0: number; // when he sent it
  t1: number | null; // when the answer was complete
  step: { kind: AskStepKind; text: string } | null;
  text: string;
  picks: AskPick[];
  result: AskResult | null;
  error: string | null;
  line: boolean; // the action line is on screen
}

export function AskScreen() {
  const [q, setQ] = useState("");
  const [run, setRun] = useState<Run | null>(null);
  const abort = useRef<AbortController | null>(null);
  const reduce = useReducedMotion();
  useEffect(() => () => abort.current?.abort(), []);
  const busy = !!run && !run.result && !run.error;

  const ask = async (text: string) => {
    const question = text.trim().slice(0, ASK_MAX_CHARS);
    if (!question || busy) return;
    const id = (run?.id ?? 0) + 1;
    const ctl = (abort.current = new AbortController());
    setRun({ id, q: question, t0: Date.now(), t1: null, step: null, text: "", picks: [], result: null, error: null, line: true });
    const patch = (f: (r: Run) => Partial<Run>) => setRun((r) => (r && r.id === id ? { ...r, ...f(r) } : r));
    const finish = (res: AskResponse) => patch(() => (res.ok ? { result: res, text: res.answer, picks: res.picks, t1: Date.now() } : { error: res.message, line: false }));
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json", Accept: ASK_STREAM_TYPE }, body: JSON.stringify({ question }), signal: ctl.signal });
      // checks that fail before any work (too long, rate limited, no key) come back as one JSON answer, as before
      if (!res.body || !res.headers.get("content-type")?.includes(ASK_STREAM_TYPE)) return finish(await res.json());
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let last = false;
      const handle = (e: AskEvent) => {
        if (e.type === "step") patch(() => ({ step: { kind: e.step, text: e.text } }));
        else if (e.type === "delta") patch((r) => ({ text: r.text + e.text }));
        else if (e.type === "picks") patch(() => ({ picks: e.picks }));
        else if (e.type === "done") { last = true; finish(e.result); }
        else if (e.type === "error") { last = true; finish({ ok: false, error: e.error, message: e.message }); }
      };
      for (;;) {
        const { value, done } = await reader.read();
        if (value) buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (line) handle(JSON.parse(line) as AskEvent);
        }
        if (done) break;
      }
      if (!last) finish({ ok: false, error: "gemini_error", message: CUT_OFF });
    } catch {
      if (!ctl.signal.aborted) finish({ ok: false, error: "gemini_error", message: NO_REACH });
    }
  };
  const lineDone = useCallback(() => setRun((r) => (r ? { ...r, line: false } : r)), []);
  const glide = reduce ? { duration: 0 } : SPRING;
  const fadeIn = (i: number) => (reduce ? { duration: 0 } : { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.05 });
  return (
    <Screen top={<div className="topbar">
        <Link href="/" className="iconbtn" aria-label="Back"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
        <span className="center">Ask SlugGrub</span>
        <span style={{ width: 38 }} />
      </div>}>
<h1 className="title-xl">What are you in the mood for?</h1>
      {run && (
        <Appear id={run.error ? `error:${run.id}` : `run:${run.id}`} style={{ display: "grid", gap: 10, position: "relative" }}>
          {run.error ? (
            <div className="card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span className="iconbtn" style={{ width: 44, height: 44, background: "var(--paper-2)" }}><Icon icon={Alert02Icon} size={20} sw={2} /></span>
              <div className="body" style={{ flex: 1, minWidth: 0 }}>{run.error}</div>
            </div>
          ) : (
            <LayoutGroup id={`ask-${run.id}`}>
              <div className="label">For &ldquo;{run.q}&rdquo;</div>
              <AnimatePresence mode="popLayout" initial={false}>
                {run.line && (
                  <motion.div key="line" exit={{ opacity: 0, filter: "blur(2px)" }} transition={reduce ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}>
                    <AskActionLine step={run.step} startedAt={run.t0} endedAt={run.t1} onSettled={lineDone} />
                  </motion.div>
                )}
              </AnimatePresence>
              {run.text && (
                <motion.div layout="position" transition={{ layout: glide }}>
                  <StreamText className="body" style={{ margin: 0 }} text={run.text} final={!!run.result} />
                </motion.div>
              )}
              {run.result && run.picks.map((d, i) => {
                const photo = dishPhoto(d.name);
                return (
                  <motion.div layout="position" key={d.hallId + d.recipeId} className="card tight" style={{ display: "flex", gap: 12, alignItems: "center" }}
                    initial={reduce ? false : { opacity: 0, filter: "blur(2px)" }} animate={{ opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                    transition={{ layout: glide, opacity: fadeIn(i), filter: fadeIn(i) }}>
                    {photo
                      ? <Photo src={photo} w={56} h={56} r={12} />
                      : <span className="iconbtn" aria-hidden style={{ width: 56, height: 56, borderRadius: 12, background: "var(--paper-2)" }}><Icon icon={RiceBowl01Icon} size={20} /></span>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{d.name}</div>
                      <div className="num label" style={{ fontSize: 12 }}>{[d.hallShort, d.calories !== undefined ? `${d.calories} cal` : "no label", d.proteinG !== undefined ? `${d.proteinG}g protein` : "", portionText(d.portion)].filter(Boolean).join(" · ")}</div>
                      <div className="label" style={{ fontSize: 12 }}>{d.open ? d.reason : `${d.reason} · ${d.when}`}</div>
                    </div>
                  </motion.div>
                );
              })}
              {run.result?.fallback && (
                <motion.p layout="position" transition={{ layout: glide }} className="label" style={{ fontSize: 12, margin: "0 4px" }}>Today&apos;s menus aren&apos;t saved yet, so these come from the nearest day.</motion.p>
              )}
            </LayoutGroup>
          )}
        </Appear>
      )}
      {/* suggestions sit just above the prompt bar at the bottom (his review 2026-11-14, S09) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto", paddingTop: 8 }}>
        {SUGGESTIONS.map((s) => <button key={s} type="button" className="tint blue" onClick={() => { setQ(s); ask(s); }}>{s}</button>)}
      </div>
      <form className="ask-dock" style={{ position: "sticky" }} onSubmit={(e) => { e.preventDefault(); (document.activeElement as HTMLElement | null)?.blur(); ask(q); }}>
        <input id="ask" className="input raised" value={q} onChange={(e) => setQ(e.target.value)} maxLength={ASK_MAX_CHARS} placeholder="High protein under 700 cal" aria-label="Ask SlugGrub" enterKeyHint="send" style={{ flex: 1, fontSize: 16 }} />
        {/* iOS: a tap on the button first blurs the field, the keyboard drops, the dock jumps and the tap misses. Keeping focus on
            pointer down lets the tap land; the keyboard is dismissed once the question is sent (his report 2026-11-15). */}
        <button type="submit" className="iconbtn send" disabled={busy} aria-label="Ask" onPointerDown={(e) => e.preventDefault()} onMouseDown={(e) => e.preventDefault()}><Icon icon={ArrowUp02Icon} size={22} sw={2.1} /></button>
      </form>
    </Screen>
  );
}
