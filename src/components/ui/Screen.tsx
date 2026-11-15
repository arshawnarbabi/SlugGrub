// Owner: Arshawn. A screen: background (page color + optional blue glow), scrolling content, pinned top bar, scroll edges.
// His rule 2026-11-14: the blur and fade affect ONLY content scrolled underneath, never the background. So:
//   - the glow sits behind everything and never fades; it scrolls with the page by following the scroller (Wash.tsx),
//   - content fades through a mask on the scroller (the background shows through untouched),
//   - the top bar lives outside the scroller, so it never fades or blurs,
//   - the progressive blur layers sit over the scroller (invisible over the flat background).
// Pages open static: ScreenClock stops anything from animating in while the screen opens.
import { ScreenClock } from "./motion";
import { Wash } from "./Wash";

export function Screen({ children, top, wash, noTabBar }: { children: React.ReactNode; top?: React.ReactNode; wash?: boolean; noTabBar?: boolean }) {
  return (
    <>
      {wash && <Wash />}
      <main className={`scroller ${noTabBar ? "no-tabbar" : ""} ${top ? "has-top" : ""}`}>
        <ScreenClock>{children}</ScreenClock>
      </main>
      <div className="edge top" aria-hidden><i /><i /><i /></div>
      {!noTabBar && <div className="edge bottom" aria-hidden><i /><i /><i /></div>}
      {top && <header className="topchrome"><ScreenClock>{top}</ScreenClock></header>}
    </>
  );
}
