// Owner: Arshawn (UI). One cafe or market's full menu, opened from its row on the Halls tab's Cafe board or Markets
// (src/app/halls/cafe/[id]/page.tsx passes it, trimmed on the server by src/lib/hallsView.ts getCafeMenu). Drawn like a hall's
// page in HallsScreen.tsx: a heading with the blue status tint, then one row card per item (photo or the neutral dish tile).
// No hooks or state, so it renders on the server and the page opens static. Cafes have no nutrition labels, so an item shows
// what the site lists: portion, price and diet tags.
import Link from "next/link";
import { ArrowLeft01Icon, RiceBowl01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import type { CafeMenuView } from "@/lib/hallsView";
import { dishPhoto } from "./dishPhoto";
import { portionText } from "./portion";
import { menuFromNote } from "./menuDay";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Sentence case for a category the site writes in capitals ("ON THE FRY SIDE"); every other name is kept as the site writes it. */
const heading = (s: string) => (/[a-z]/.test(s) ? s : cap(s.toLowerCase()));

/** `c` null: the route's shell before the menu is read (the top bar with the back button, nothing else). */
export function CafeMenuScreen({ c }: { c: CafeMenuView | null }) {
  const top = <div className="topbar">
    <Link href="/halls" className="iconbtn" aria-label="Back to Halls"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
    <span className="center" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c?.name}</span>
    <span style={{ width: 44, flex: "none" }} aria-hidden />
  </div>;
  if (!c) return <Screen top={top}>{null}</Screen>;
  const count = c.categories.reduce((n, k) => n + k.items.length, 0);
  return (
    <Screen top={top}>
      <div style={{ display: "grid", gap: 10 }}>
        <div className="sechead" style={{ gap: 10, alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{c.location}</h2>
            {c.description && <p className="label" style={{ fontSize: 12, margin: "4px 0 0", lineHeight: 1.4 }}>{c.description}</p>}
          </div>
          {c.status && <span className="tint blue" style={{ height: 24, fontSize: 12, flex: "none" }}>{cap(c.status)}</span>}
        </div>

        {c.week.length > 0 && (
          <div className="card" style={{ padding: "2px 14px" }}>
            {c.week.map((w) => (
              <div className="row" key={w.days}>
                <div className="grow"><div className="title" style={{ fontSize: 14 }}>{w.days}</div></div>
                <span className="num label" style={{ fontSize: 13 }}>{w.hours}</span>
              </div>
            ))}
          </div>
        )}

        {count > 0 && c.menuDate && c.menuDate !== c.date && (
          <p className="label" style={{ fontSize: 12, margin: "0 4px" }}>{menuFromNote(c.menuDate, c.date)}.</p>
        )}

        {count === 0 && <div className="card"><div className="label">No menu is posted for {c.name} this week.</div></div>}

        {c.categories.map((k, n) => (
          <section key={`${n}-${k.name}`} style={{ display: "grid", gap: 10, marginTop: 6 }}>
            <div className="sechead"><h2>{heading(k.name)}</h2><span className="num label" style={{ fontSize: 12 }}>{k.items.length} {k.items.length === 1 ? "item" : "items"}</span></div>
            {k.items.map((d, i) => {
              const photo = dishPhoto(d.name);
              const line = [d.price, portionText(d.portion), ...(d.tags ?? []).map(cap)].filter(Boolean).join(" · ");
              return (
                <div className="card tight" key={`${d.recipeId}-${d.name}-${i}`} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>{d.name}</div>
                    {line && <div className="num label" style={{ fontSize: 12, marginTop: 2 }}>{line}</div>}
                  </div>
                  {photo
                    ? <Photo src={photo} w={64} h={64} r={12} />
                    : <span className="iconbtn" aria-hidden style={{ width: 64, height: 64, borderRadius: 12, background: "var(--paper-2)", flex: "none" }}><Icon icon={RiceBowl01Icon} size={22} /></span>}
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </Screen>
  );
}
