"use client";

// Owner: Arshawn. A side-swiping pager, one full-width page at a time, shared by Rank (one matchup per page) and Halls (one hall per
// page) so both behave the same (his trial 2026-11-14, docs/DESIGN.md). Controlled: `index` is the page to show; when it changes from
// outside, the pager glides there on THE spring (instant under reduced motion, and while the screen opens, so nothing moves as a page
// opens); when the student swipes, `onIndex` gets the page it settled on. With `fitHeight`, the pager is as tall as the page it shows.
//
// 2026-11-15 (his report: on Halls "sometimes i cant scroll on the menu list ... i can only scroll like above it"): the pager was a
// native horizontal scroller (overflow-x, scroll-snap) inside the page's vertical scroller. iPhone Safari sometimes keeps a touch
// latched to the inner scroller, so a vertical swipe that starts on a menu goes nowhere. It is no longer a scroller at all: the pages
// sit on a track that follows the finger by transform (framer drag on x, which sets touch-action: pan-y), so every vertical swipe
// is the page's own native scroll, and only a sideways drag moves the pager. Release snaps to the nearest page (a flick counts) on
// THE spring.
import { Children, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";
import { SPRING_CFG, useScreenReady } from "./motion";

const GAP = 16; // the gutter between pages (and on each side), so the next page never peeks

export function Pager({ index, onIndex, onLive, children, label, fitHeight = false }: {
  index: number;
  onIndex: (n: number) => void;
  /** the page nearest the middle while the student is still dragging, every frame (for a chip that follows along) */
  onLive?: (n: number) => void;
  children: ReactNode;
  label: string;
  fitHeight?: boolean;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const ready = useScreenReady(); // a page that opens on a saved hall jumps there; it never slides while the screen opens
  const pages = Children.toArray(children);
  const count = pages.length;
  const [width, setWidth] = useState(0); // the frame's width; each page is the track's content box (width - 2 * GAP), one stride is width - GAP
  const [height, setHeight] = useState<number | undefined>(undefined);
  const x = useMotionValue(0);
  const live = useRef(index);
  const dragged = useRef(0); // when the last drag ended, so the tap that ends a drag doesn't press a button

  const stride = Math.max(1, width - GAP);
  const clamp = (n: number) => Math.max(0, Math.min(count - 1, n));

  // measure the frame (the pager runs edge to edge, past the 16px gutter, like .carousel)
  useLayoutEffect(() => {
    const box = outer.current;
    if (!box) return;
    const measure = () => setWidth(box.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  // go to `index` when it changes from outside (a chip, Skip, a new matchup) or the width changes
  useLayoutEffect(() => {
    if (!width) return;
    const to = -clamp(index) * stride;
    live.current = clamp(index);
    if (reduce || !ready || Math.abs(x.get() - to) < 1) x.set(to);
    else animate(x, to, { type: "spring", ...SPRING_CFG });
  }, [index, width, count]); // eslint-disable-line react-hooks/exhaustive-deps

  // fitHeight: follow the shown page's height, including when its content changes (a meal switch)
  useEffect(() => {
    if (!fitHeight) return;
    const page = track.current?.children[clamp(index)] as HTMLElement | undefined;
    if (!page) return;
    const ro = new ResizeObserver(() => setHeight(page.offsetHeight));
    ro.observe(page);
    setHeight(page.offsetHeight);
    return () => ro.disconnect();
  }, [fitHeight, index, count]); // eslint-disable-line react-hooks/exhaustive-deps

  // the page nearest the middle while dragging, for a chip that follows along
  useEffect(() => x.on("change", (v) => {
    if (!onLive) return;
    const n = clamp(Math.round(-v / stride));
    if (n !== live.current) { live.current = n; onLive(n); }
  }), [x, stride, onLive, count]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragEnd = (_: unknown, info: PanInfo) => {
    dragged.current = performance.now();
    const from = clamp(index);
    // a flick moves one page; otherwise the nearest page to where it was let go
    const flick = Math.abs(info.velocity.x) > 350 ? (info.velocity.x < 0 ? 1 : -1) : 0;
    const n = clamp(flick ? from + flick : Math.round(-x.get() / stride));
    const to = -n * stride;
    if (reduce) x.set(to);
    else animate(x, to, { type: "spring", ...SPRING_CFG, velocity: info.velocity.x });
    live.current = n;
    if (n !== index) onIndex(n);
  };

  return (
    <div ref={outer} role="region" aria-label={label} className="pager-frame"
      style={{ overflow: "hidden", margin: `0 -${GAP}px`, height: fitHeight ? height : undefined }}>
      <motion.div ref={track} className="pager-track"
        drag={count > 1 ? "x" : false} dragDirectionLock dragMomentum={false} dragElastic={0.12}
        dragConstraints={{ left: -(count - 1) * stride, right: 0 }}
        onDragEnd={onDragEnd}
        onClickCapture={(e) => { if (performance.now() - dragged.current < 250) { e.preventDefault(); e.stopPropagation(); } }}
        style={{ x, display: "flex", gap: GAP, padding: `0 ${GAP}px`, alignItems: fitHeight ? "flex-start" : undefined, touchAction: "pan-y" }}>
        {pages.map((p, n) => (
          <div className="pager-page" key={(p as { key?: string }).key ?? n} aria-hidden={n !== index}
            style={{ flex: "0 0 100%", minWidth: 0 }}>{p}</div>
        ))}
      </motion.div>
    </div>
  );
}
