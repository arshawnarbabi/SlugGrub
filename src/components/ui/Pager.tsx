"use client";

// Owner: Arshawn. A side-scrolling pager, one full-width page at a time, shared by Rank (one matchup per page) and Halls (one hall
// per page) so both behave the same (his trial 2026-11-14, docs/DESIGN.md). Native scroll with x mandatory snap; it scrolls edge
// to edge but each page rests on the 16px gutter (.carousel). Controlled: `index` is the page to show; when it changes from
// outside, the pager scrolls there (smooth, instant under reduced motion, instant on first paint so nothing moves as a page
// opens); when the student swipes, `onIndex` gets the page the scroll settled on. With `fitHeight`, the pager is as tall as the
// page it shows, so a short page doesn't leave the tallest page's gap under it.
import { Children, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useScreenReady } from "./motion";

export function Pager({ index, onIndex, onLive, children, label, fitHeight = false }: {
  index: number;
  onIndex: (n: number) => void;
  /** the page nearest the middle while the student is still scrolling, every frame (for a chip that follows along) */
  onLive?: (n: number) => void;
  children: ReactNode;
  label: string;
  fitHeight?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const settle = useRef<number | undefined>(undefined);
  const ready = useScreenReady(); // a page that opens on a saved hall jumps there; it never slides while the screen opens
  const frame = useRef(0);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const pages = Children.toArray(children);

  const offsetOf = (n: number) => {
    const box = el.current, first = box?.children[0] as HTMLElement | undefined, page = box?.children[n] as HTMLElement | undefined;
    return first && page ? page.offsetLeft - first.offsetLeft : null;
  };
  const shown = () => {
    const box = el.current;
    const stride = offsetOf(1) ?? box?.clientWidth ?? 1;
    return box ? Math.max(0, Math.min(box.children.length - 1, Math.round(box.scrollLeft / stride))) : 0;
  };

  // scroll to `index` when it changes from outside (a chip, Skip, a new matchup)
  useLayoutEffect(() => {
    const box = el.current, left = offsetOf(index);
    if (!box || left === null) return;
    if (shown() !== index || Math.abs(box.scrollLeft - left) > 1) {
      box.scrollTo({ left, behavior: reduce || !ready ? "instant" : "smooth" });
    }
  }, [index, pages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // fitHeight: follow the shown page's height, including when its content changes (a meal switch)
  useEffect(() => {
    if (!fitHeight) return;
    const page = el.current?.children[index] as HTMLElement | undefined;
    if (!page) return;
    const ro = new ResizeObserver(() => setHeight(page.offsetHeight));
    ro.observe(page);
    setHeight(page.offsetHeight);
    return () => ro.disconnect();
  }, [fitHeight, index, pages.length]);

  useEffect(() => () => { window.clearTimeout(settle.current); cancelAnimationFrame(frame.current); }, []);
  const onScroll = () => {
    if (onLive && !frame.current) frame.current = requestAnimationFrame(() => { frame.current = 0; onLive(shown()); });
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => { const n = shown(); if (n !== index) onIndex(n); }, 90);
  };

  return (
    <div ref={el} className="carousel pager" role="region" aria-label={label} onScroll={onScroll}
      style={fitHeight ? { height, overflowY: "hidden", alignItems: "flex-start" } : undefined}>
      {pages.map((p, n) => (
        <div className="pager-page" key={(p as { key?: string }).key ?? n} aria-hidden={n !== index}>{p}</div>
      ))}
    </div>
  );
}
