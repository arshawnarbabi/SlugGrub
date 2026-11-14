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

/** The food button: tap it and two droplets split off (Log a plate, Ask SlugGrub). The only split/merge goo in the app. */
export function FoodButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : SPRING_CFG;
  const go = (href: string) => { setOpen(false); router.push(href); };
  return (
    <div className="food-wrap">
      <Liquid
        style={{ position: "relative", width: 62, height: 62 }}
        filterPadding={96}
        {...GOO}
        fill="var(--p9)"
        shadow="0 1px 2px rgba(20,30,50,.12), 0 8px 18px -8px rgba(20,30,50,.32), inset 0 1px 0 rgba(255,255,255,.3)"
      >
        <Liquid.Item x={open ? -60 : 0} y={open ? -48 : 0} transition={t} style={{ position: "absolute", left: 7, top: 7 }}>
          <button type="button" className={`drop ${open ? "on" : ""}`} aria-label="Ask SlugGrub" tabIndex={open ? 0 : -1} onClick={() => go("/ask")}>
            <Icon icon={SparklesIcon} size={20} sw={1.9} />
          </button>
        </Liquid.Item>
        <Liquid.Item x={0} y={open ? -78 : 0} transition={t} delay={reduce ? 0 : 45} style={{ position: "absolute", left: 7, top: 7 }}>
          <button type="button" className={`drop ${open ? "on" : ""}`} aria-label="Log a plate" tabIndex={open ? 0 : -1} onClick={() => go("/log")}>
            <Icon icon={Camera01Icon} size={20} sw={1.9} />
          </button>
        </Liquid.Item>
        <Liquid.Item style={{ position: "absolute", left: 0, top: 0 }}>
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
