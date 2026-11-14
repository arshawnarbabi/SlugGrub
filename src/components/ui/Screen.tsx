// Owner: Arshawn. A scrolling screen between the iOS-style edges (blur budget: 2 layers per edge).
// Pages open static: ScreenClock stops anything from animating in while the screen opens.
import { ScreenClock } from "./motion";
export function Screen({ children, wash, noTabBar }: { children: React.ReactNode; wash?: boolean; noTabBar?: boolean }) {
  return (
    <>
      <main className={`scroller ${noTabBar ? "no-tabbar" : ""}`}>
        {wash && <div className="wash" aria-hidden />}
        <ScreenClock>{children}</ScreenClock>
      </main>
      <div className="edge top" aria-hidden><i /><i /><b /></div>
      {!noTabBar && <div className="edge bottom" aria-hidden><i /><i /><b /></div>}
    </>
  );
}
