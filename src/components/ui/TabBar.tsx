"use client";

// Owner: Arshawn. The floating nav bar (Sidestash finish) with the goo thumb, plus the gooey food button.
// It lives in the root layout so it stays put and the thumb slides between tabs on THE spring.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Liquid } from "liquid-gooey";
import { Home09Icon, ChampionIcon, Restaurant01Icon, Wallet01Icon, RiceBowl01Icon, Cancel01Icon, Camera01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { GooTrack, Swap, GOO, SPRING_CFG } from "./motion";

const TABS = [
  { href: "/", label: "Today", icon: Home09Icon },
  { href: "/rank", label: "Rank", icon: ChampionIcon },
  { href: "/halls", label: "Halls", icon: Restaurant01Icon },
  { href: "/budget", label: "Budget", icon: Wallet01Icon },
];
const HIDE_ON = ["/vote", "/onboarding", "/brand", "/dining-services"];

export function TabBar() {
  const path = usePathname();
  const refs = useRef<(HTMLElement | null)[]>([]);
  if (HIDE_ON.some((p) => path.startsWith(p))) return null;
  const index = TABS.findIndex((t) => (t.href === "/" ? path === "/" : path.startsWith(t.href)));
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="pillbar">
        <div className="track">
          <GooTrack index={index} refs={refs} fill="var(--paper-2)" deps={path.length} />
          {TABS.map((t, i) => {
            const on = i === index;
            return (
              <Link key={t.href} href={t.href} ref={(el) => { refs.current[i] = el; }} className={`tab ${on ? "on" : ""}`} aria-current={on ? "page" : undefined}>
                <Icon icon={t.icon} size={21} sw={on ? 2.1 : 1.7} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      <FoodButton />
    </nav>
  );
}

/** The food button: tap it and two droplets split off (Log a plate, Ask SlugGrub). The only split/merge goo in the app.
 *  WebKit (every iPhone browser) clips the goo layer to the Liquid element's own box: its root SVG is a promoted, CSS-filtered layer
 *  and overflow: visible is ignored there (2026-11-15, his recording: droplets with no blue blob, the button's corner cut square).
 *  So the Liquid element itself covers everywhere the droplets travel, plus room for the goo edge and the shadow, and nothing relies
 *  on overflow. It hangs off the 62px button with negative offsets, so the tab bar layout is unchanged, and lets taps through
 *  (pointer-events none) except on the buttons. filterPadding 0: the box already holds every piece, so the filter covers only it. */
const FOOD = { left: 69, top: 87, right: 12, bottom: 14 }; // room around the 62px button: droplets reach 53px left and 71px up, + goo edge and shadow
const DROP_AT = { position: "absolute", left: FOOD.left + 7, top: FOOD.top + 7 } as const;
export function FoodButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : SPRING_CFG;
  const go = (href: string) => { setOpen(false); router.push(href); };
  return (
    <div className="food-wrap">
      <Liquid
        className="food-liquid"
        style={{ position: "absolute", left: -FOOD.left, top: -FOOD.top, width: FOOD.left + 62 + FOOD.right, height: FOOD.top + 62 + FOOD.bottom }}
        filterPadding={0}
        {...GOO}
        fill="var(--p9)"
        shadow={FOOD_SHADOW}
      >
        <Liquid.Item x={open ? -60 : 0} y={open ? -48 : 0} transition={t} style={DROP_AT}>
          <button type="button" className={`drop ${open ? "on" : ""}`} aria-label="Ask SlugGrub" tabIndex={open ? 0 : -1} onClick={() => go("/ask")}>
            <Icon icon={SparklesIcon} size={20} sw={1.9} />
          </button>
        </Liquid.Item>
        <Liquid.Item x={0} y={open ? -78 : 0} transition={t} delay={reduce ? 0 : 45} style={DROP_AT}>
          <button type="button" className={`drop ${open ? "on" : ""}`} aria-label="Log a plate" tabIndex={open ? 0 : -1} onClick={() => go("/log")}>
            <Icon icon={Camera01Icon} size={20} sw={1.9} />
          </button>
        </Liquid.Item>
        <Liquid.Item style={{ position: "absolute", left: FOOD.left, top: FOOD.top }}>
          <button type="button" className="food-main" aria-label={open ? "Close" : "Log food or ask"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Swap id={open ? "x" : "food"} rotate={90}>
              <Icon icon={open ? Cancel01Icon : RiceBowl01Icon} size={25} sw={1.9} />
            </Swap>
          </button>
        </Liquid.Item>
      </Liquid>
    </div>
  );
}

/** The blob's shadow: one plain drop shadow (no spread), which liquid-gooey hands to CSS and WebKit composites on the GPU, and the
 *  white top sheen, the one pass left inside the SVG filter. The old lift shadow had a -8px spread, which forced an erode + blur
 *  pass over the whole filter area on every frame of the split (CPU raster on WebKit). */
export const FOOD_SHADOW = "0 4px 10px rgba(20,30,50,.24), inset 0 1px 0 rgba(255,255,255,.3)";
