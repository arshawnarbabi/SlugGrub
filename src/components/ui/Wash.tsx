"use client";

// Owner: Arshawn. The blue glow at the top of a screen. It scrolls with the page (his ask 2026-11-14: "make the blue wash not
// sticky but scroll with the page") yet stays outside the scroller, so the scroller's fade mask and the edge blur never touch it
// (his rule: blur and fade affect only content). It follows the scroller with a transform, written once per frame: no layout work.
import { useEffect, useRef } from "react";

export function Wash() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const scroller = el?.nextElementSibling as HTMLElement | null;
    if (!el || !scroller) return;
    let frame = 0;
    const move = () => { frame = 0; el.style.transform = `translate3d(0, ${-scroller.scrollTop}px, 0)`; };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(move); };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    move();
    return () => { scroller.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return <div ref={ref} className="wash" aria-hidden />;
}
