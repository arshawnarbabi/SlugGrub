// Owner: Arshawn. Brand kit preview of the DRAFT design system (docs/DESIGN.md, # draft until approved).
// Mock data only. Food photos: public/brand/food (Unsplash, see CREDITS.txt). Not linked from the tab bar.

import type { Metadata } from "next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Camera01Icon, Home09Icon, ChampionIcon, Restaurant01Icon, Wallet01Icon, ArrowLeft01Icon,
  MoreHorizontalIcon, Search01Icon, Clock01Icon, Location01Icon, ArrowUp01Icon, ArrowDown01Icon,
  ArrowRight01Icon, SparklesIcon, StarIcon, Undo02Icon, MinusSignIcon, PlusSignIcon, FireIcon,
  Notification01Icon, Wifi01Icon, CellularNetworkIcon, CrownIcon, QrCodeIcon,
} from "@hugeicons/core-free-icons";
import { SurfaceToggle, FontCard } from "./SurfaceToggle";
import { MotionTabBar, Seg, CountUp, Duel, CameraMenu } from "./Interactive";
import { FONTS, FONT_VARS } from "./fonts";
import "./brand.css";

export const metadata: Metadata = { title: "SlugGrub brand kit" };

type IconDef = Parameters<typeof HugeiconsIcon>[0]["icon"];
function I({ icon, size = 18, sw = 1.8, color = "currentColor" }: { icon: IconDef; size?: number; sw?: number; color?: string }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={sw} color={color} />;
}

type Food = "tikka" | "pizza" | "poke" | "grain-bowl" | "steak-salad" | "garden-salad" | "pancakes" | "pad-thai" | "wrap" | "penne";
function Photo({ food, w, h, r, children }: { food: Food; w: number | string; h: number; r?: number; children?: React.ReactNode }) {
  return (
    <div className="ph" style={{ width: w, height: h, borderRadius: r }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="photo" src={`/brand/food/${food}.jpg`} alt="" />
      {children}
    </div>
  );
}

function Status({ light }: { light?: boolean }) {
  return (
    <div className="status num" style={{ color: light ? "white" : undefined, position: "relative", zIndex: 2 }}>
      <span>6:41</span>
      <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <I icon={CellularNetworkIcon} size={14} sw={2} /><I icon={Wifi01Icon} size={14} sw={2} />
        <span style={{ width: 22, height: 11, borderRadius: 3, border: "1.5px solid currentColor", padding: 1.5, display: "inline-flex" }}><span style={{ flex: 1, background: "currentColor", borderRadius: 1 }} /></span>
      </span>
    </div>
  );
}

function TabBar({ active }: { active: "today" | "rank" | "halls" | "budget" }) {
  return <MotionTabBar active={active} />;
}

function Phone({ label, children, tab, wash, footer }: { label: string; children: React.ReactNode; tab?: Parameters<typeof TabBar>[0]["active"]; wash?: boolean; footer?: React.ReactNode }) {
  return (
    <div className="phone-col">
      <div className="phone">
        <div className="screen">{wash && <div className="wash" />}{children}</div>
        <div className="edge top" aria-hidden><i /><i /><i /><i /><i /><b /></div>
        <div className="edge bottom" aria-hidden><i /><i /><i /><i /><i /><b /></div>
        <Status />
        {footer}
        {tab && <TabBar active={tab} />}
      </div>
      <div className="phone-label">{label}</div>
    </div>
  );
}

/* ───────── mock screens ───────── */

function TodayScreen() {
  return (
    <>
      <div className="topbar" style={{ marginTop: 4 }}>
        <span className="tint blue"><I icon={Location01Icon} size={14} sw={2} /> JRL/C9</span>
        <div className="iconbtn"><I icon={Notification01Icon} size={18} /></div>
      </div>
      <div>
        <div className="eyebrow" style={{ position: "relative" }}>Dinner · open till 8 PM</div>
        <div className="title-xl">Good evening, Maya</div>
      </div>

      <div className="card press" style={{ padding: 0, overflow: "hidden" }}>
        <Photo food="tikka" w="100%" h={148} r={0}>
          <span className="on-photo gold"><I icon={CrownIcon} size={13} sw={2} /> #1 at your hall</span>
        </Photo>
        <div style={{ padding: "12px 14px 14px", display: "grid", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <b style={{ fontSize: 17, letterSpacing: "-0.02em" }}>Chicken Tikka Masala</b>
            <span className="stars"><I icon={StarIcon} size={13} sw={2} color="var(--y11)" />9.1</span>
          </div>
          <div className="num" style={{ fontSize: 13, color: "var(--ink-3)" }}>540 cal · 1 cup · ranked by 37 students</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="eyebrow">Slug Points</div>
          <div className="num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 2 }}>1,120</div>
          <div style={{ height: 6, background: "var(--paper-2)", borderRadius: 9, marginTop: 6, overflow: "hidden" }}><div style={{ width: "58%", height: "100%", background: "var(--p9)", borderRadius: 9 }} /></div>
          <div style={{ fontSize: 12, color: "var(--ok)", marginTop: 6, fontWeight: 600 }}>On pace</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="eyebrow">Your college</div>
          <div className="num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 2 }}>#3</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>Porter this week</div>
          <span className="delta up" style={{ marginTop: 6 }}><I icon={ArrowUp01Icon} size={12} sw={2.4} />1</span>
        </div>
      </div>

      <div className="card press" style={{ display: "flex", alignItems: "center", gap: 10, padding: 10 }}>
        <Photo food="pad-thai" w={44} h={44} r={12} />
        <Photo food="wrap" w={44} h={44} r={12} />
        <div style={{ flex: 1, minWidth: 0, fontSize: 13 }}><b>Which was better at lunch?</b><div style={{ color: "var(--ink-3)", fontSize: 12 }}>Takes 2 seconds</div></div>
        <div className="iconbtn" style={{ width: 32, height: 32 }}><I icon={ArrowRight01Icon} size={16} /></div>
      </div>

      <div className="sechead" style={{ marginTop: 4 }}><b>Best on campus tonight</b><span className="seeall">See all</span></div>
      {([["penne", "Penne Arrabbiata", "Cowell/Stevenson · 8.8"], ["poke", "Salmon Poke Bowl", "Crown/Merrill · 8.9"], ["grain-bowl", "Harvest Grain Bowl", "Porter/Kresge · 8.6"]] as [Food, string, string][]).map(([f, n, d]) => (
        <div className="card press" key={f} style={{ display: "flex", gap: 12, alignItems: "center", padding: 10 }}>
          <Photo food={f} w={56} h={56} r={12} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>{n}</div><div className="num" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{d}</div></div>
        </div>
      ))}
    </>
  );
}

function HallsScreen() {
  const best: [Food, string, string, string][] = [
    ["poke", "Salmon Poke Bowl", "8.9", "Crown/Merrill"],
    ["grain-bowl", "Harvest Grain Bowl", "8.6", "Porter/Kresge"],
    ["penne", "Penne Arrabbiata", "8.8", "Cowell/Stevenson"],
  ];
  return (
    <>
      <div className="topbar" style={{ marginTop: 4 }}>
        <div className="title-xl">Halls</div>
        <div className="iconbtn"><I icon={Search01Icon} size={18} /></div>
      </div>
      <Seg options={["Breakfast", "Lunch", "Dinner"]} initial="Dinner" start />
      <div className="sechead"><b>Best tonight</b><span className="seeall">See all</span></div>
      <div className="carousel">
        {best.map(([f, n, s, h]) => (
          <div className="item" key={f}>
            <Photo food={f} w={150} h={150}>
              <span className="on-photo"><I icon={StarIcon} size={12} sw={2.2} color="var(--y11)" />{s}</span>
            </Photo>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{n}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: -3 }}>{h}</div>
          </div>
        ))}
      </div>
      <div className="sechead" style={{ marginTop: 4 }}><b>JRL/C9 tonight</b><span className="tint blue" style={{ height: 24, fontSize: 12 }}>Open till 8</span></div>
      <div style={{ display: "grid", gap: 10 }}>
        {([["steak-salad", "Steak Salad", "420 cal", "8.2"], ["pizza", "Flatbread Pizza", "290 cal a slice", "7.6"], ["garden-salad", "Garden Salad", "180 cal", "7.4"], ["pancakes", "Buttermilk Pancakes", "350 cal, brunch", "8.0"]] as [Food, string, string, string][]).map(([f, n, c, s]) => (
          <div className="card press" key={f} style={{ display: "flex", gap: 12, alignItems: "center", padding: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>{n}</div><div className="num" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{c} · <span style={{ color: "var(--ink-2)" }}>{s}</span></div></div>
            <Photo food={f} w={64} h={64} r={14} />
          </div>
        ))}
      </div>
    </>
  );
}

function RankScreen() {
  return (
    <>
      <div className="topbar" style={{ marginTop: 4 }}>
        <div className="iconbtn"><I icon={ArrowLeft01Icon} size={18} /></div>
        <span className="eyebrow">Lunch at JRL/C9</span>
        <div className="iconbtn"><I icon={MoreHorizontalIcon} size={18} /></div>
      </div>
      <div className="title-xl" style={{ marginTop: 4 }}>Which was better?</div>
            <Duel a={{ src: "/brand/food/pad-thai.jpg", name: "Shrimp Pad Thai", meta: "410 cal · #4" }} b={{ src: "/brand/food/wrap.jpg", name: "Chicken Wrap", meta: "520 cal · #9" }} />
    </>
  );
}

function PhotoScreen() {
  return (
    <>
      <div className="topbar" style={{ marginTop: 4 }}>
        <div className="iconbtn"><I icon={ArrowLeft01Icon} size={18} /></div>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Your plate</span>
        <div className="iconbtn"><I icon={MoreHorizontalIcon} size={18} /></div>
      </div>
      <Photo food="tikka" w="100%" h={150} r={24}>
        <span className="on-photo">Dinner · JRL/C9</span>
      </Photo>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="iconbtn" style={{ width: 44, height: 44, background: "var(--paper-2)", border: 0 }}><I icon={FireIcon} size={20} sw={2} /></div>
        <div style={{ flex: 1 }}><div className="eyebrow">Calories · only you see this</div><div className="hero-num" style={{ fontSize: 36 }}><CountUp to={830} /></div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[["Protein", "38g", "var(--protein)"], ["Carbs", "44g", "var(--carbs)"], ["Fat", "30g", "var(--fat)"]].map(([n, v, c]) => (
          <div className="card" key={n} style={{ padding: 10 }}>
            <div style={{ fontSize: 12, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: 9, background: c }} />{n}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: "2px 12px" }}>
        {[["Chicken Tikka Masala", "1.5", "810"], ["Steamed Jasmine Rice", "1", "120"]].map(([n, s, c]) => (
          <div className="row" key={n}>
            <div className="grow"><div className="title">{n}</div><div className="sub num"><span className="q">{s} servings</span> · {c} cal</div></div>
            <div style={{ display: "flex", gap: 6 }}>
              <span className="iconbtn" style={{ width: 28, height: 28 }}><I icon={MinusSignIcon} size={13} sw={2.2} /></span>
              <span className="iconbtn" style={{ width: 28, height: 28 }}><I icon={PlusSignIcon} size={13} sw={2.2} /></span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function BudgetScreen() {
  const r = 84, c = 2 * Math.PI * r, arc = c * 0.75, filled = arc * 0.58;
  return (
    <>
      <div className="topbar" style={{ marginTop: 4 }}>
        <div className="title-xl">Budget</div>
        <span className="tint blue">Gold plan</span>
      </div>
      <div className="card" style={{ position: "relative", height: 214, display: "grid", placeItems: "center" }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute", top: 14, transform: "rotate(135deg)" }} aria-hidden>
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--paper-2)" strokeWidth="12" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--p9)" strokeWidth="12" strokeDasharray={`${filled} ${c}`} strokeLinecap="round" />
        </svg>
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <div className="eyebrow">Points left</div>
          <div className="hero-num" style={{ fontSize: 46 }}><CountUp to={1120} /></div>
          <span className="pill ok" style={{ marginTop: 6 }}><span className="dot" />On track</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="card" style={{ padding: 12 }}><div className="eyebrow">Per day</div><div className="num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>41</div></div>
        <div className="card" style={{ padding: 12 }}><div className="eyebrow">Days left</div><div className="num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>27</div></div>
      </div>
      <div className="card" style={{ padding: 12 }}>
        <div className="eyebrow">Spending vs ideal pace</div>
        <svg viewBox="0 0 240 60" width="100%" height="60" aria-hidden style={{ marginTop: 6 }}>
          <line x1="4" y1="56" x2="236" y2="6" stroke="var(--ink-3)" strokeDasharray="3 4" strokeWidth="1.5" />
          <polyline points="4,56 40,50 76,41 112,35 148,29" fill="none" stroke="var(--p9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="148" cy="29" r="4.5" fill="var(--p9)" stroke="var(--card)" strokeWidth="2" />
        </svg>
      </div>
    </>
  );
}

function LeaderboardScreen() {
  const rows = [
    ["1", "Crown/Merrill", "var(--c-crown)", "1,251", 0],
    ["2", "Cowell/Stevenson", "var(--c-cowell)", "1,238", 1],
    ["3", "Porter/Kresge", "var(--c-porter)", "1,210", 1],
    ["4", "JRL/C9", "var(--c-jrl)", "1,195", -2],
    ["5", "Carson/Oakes", "var(--c-oakes)", "1,170", 0],
  ] as const;
  return (
    <>
      <div className="topbar" style={{ marginTop: 4 }}>
        <div className="title-xl">Leaderboard</div>
        <div className="iconbtn"><I icon={QrCodeIcon} size={18} /></div>
      </div>
      <Seg options={["Halls", "Dishes", "Colleges"]} initial="Halls" start />
      <div className="card" style={{ padding: 14 }}>
        <div className="eyebrow">Week of Nov 10</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.15, marginTop: 2 }}>Porter is <span style={{ color: "var(--p9)" }}>#3</span> and climbing</div>
      </div>
      <div className="card" style={{ padding: "2px 12px" }}>
        {rows.map(([n, h, c, s, ch]) => (
          <div className={`row ${h.startsWith("Porter") ? "me" : ""}`} key={n}>
            <span className="rank-n">{n}</span>
            <span style={{ width: 8, height: 26, borderRadius: 9, background: c }} />
            <div className="grow"><div className="title">{h}</div><div className="sub num">{s} pts</div></div>
            {ch > 0 && <span className="delta up"><I icon={ArrowUp01Icon} size={12} sw={2.4} />{ch}</span>}
            {ch < 0 && <span className="delta down"><I icon={ArrowDown01Icon} size={12} sw={2.4} />{-ch}</span>}
            {ch === 0 && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>same</span>}
          </div>
        ))}
      </div>
    </>
  );
}

function VoteScreen() {
  return (
    <>
      <div className="topbar" style={{ marginTop: 4 }}>
        <span className="tint gold"><span className="dot" style={{ background: "var(--bad)" }} /> Live · 214 votes</span>
        <div className="iconbtn"><I icon={QrCodeIcon} size={18} /></div>
      </div>
      <div className="title-xl">Dish of the week</div>
      <div style={{ fontSize: 14, color: "var(--ink-2)", marginTop: -4 }}>Final round. Scan the code to vote.</div>
      <div className="vote">
        <div className="blk photo-blk" style={{ minHeight: 200 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/food/penne.jpg" alt="" />
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
              <div><div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>Penne Arrabbiata</div><div style={{ fontSize: 12, opacity: 0.85 }}>Cowell/Stevenson</div></div>
              <div className="num" style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.04em" }}>62%</div>
            </div>
            <div className="bar"><i style={{ width: "62%" }} /></div>
          </div>
        </div>
        <div className="blk photo-blk" style={{ minHeight: 150 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/food/pad-thai.jpg" alt="" />
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
              <div><div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>Shrimp Pad Thai</div><div style={{ fontSize: 12, opacity: 0.85 }}>JRL/C9</div></div>
              <div className="num" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em" }}>38%</div>
            </div>
            <div className="bar"><i style={{ width: "38%" }} /></div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────── page ───────── */

const SCALE = Array.from({ length: 12 }, (_, i) => i + 1);
const SWATCHES: [string, string, string][] = [
  ["Mist", "--paper", "Page background"],
  ["White", "--card", "Cards and sheets"],
  ["Ink", "--ink", "Main text"],
  ["SlugGrub Blue", "--p9", "Brand, actions, camera"],
  ["Blue tint", "--p3", "Chip and pill backgrounds"],
  ["UCSC Gold", "--y9", "#1 dish, highlights"],
  ["On track", "--ok", "Good status, up"],
  ["Off track", "--bad", "Over budget, down"],
];
const COLLEGES: [string, string][] = [["JRL/C9", "--c-jrl"], ["Cowell/Stevenson", "--c-cowell"], ["Crown/Merrill", "--c-crown"], ["Porter/Kresge", "--c-porter"], ["Carson/Oakes", "--c-oakes"]];
const PATTERNS: [string, string, string][] = [
  ["Ninety percent neutral", "White, near-white and gray carry the screen. The brand color shows up in one or two places per screen, so it means something when it does.", "Cal AI, Airbnb, Crouton"],
  ["Three type levels, no more", "One big bold title or number, one medium semibold line, one small gray line. Tight tracking on the big one. Never all caps.", "Cal AI, Beli, Airbnb"],
  ["Big left-aligned titles", "Each screen opens with a 28 to 34px bold title on the left, with round icon buttons beside it instead of a centered nav bar.", "Airbnb, Crouton, Beli"],
  ["Hairline cards on a soft canvas", "White cards on a near-white canvas, a 1px border you barely see, and a shadow you feel more than see. Corners 20 to 28px.", "Cal AI, Copilot, Chalk"],
  ["Circles and capsules", "Back, more and search are round buttons. Main actions are tall pills. Choices are segmented pills. Almost nothing is a sharp rectangle.", "Cal AI, Airbnb, Crouton"],
  ["Floating chrome", "The tab bar and the main action float above the content with an inset and a soft fade underneath, so content runs edge to edge.", "Cal AI, Airbnb, Jomo"],
  ["Photos do the talking", "Food photos are large, cropped square or full width, with rounded corners. Labels sit on the photo as small white pills.", "Airbnb, Partiful, food apps"],
  ["One hero number", "Each screen has one number that matters, set big and bold with tabular figures. Units smaller and gray. Changes shown as small tinted pills with arrows.", "Cal AI, Copilot, Revolut"],
  ["Color means something", "Color is used for meaning only: macros, status, a highlighted amount. Tinted chips use the same hue at 10 to 15 percent behind the text.", "Copilot, Crouton, Cal AI"],
  ["A soft brand glow", "A faint wash of the brand color at the top of the main screen instead of a flat header.", "Copilot, Jomo, Partiful"],
  ["One icon style", "One icon family at one stroke weight, rounded ends, in ink or gray. The active tab gets a slightly heavier stroke.", "Chalk, Cal AI"],
  ["Short, plain words", "Sentence case, numbers first, two to five word labels. \"Takes 2 seconds\" beats a paragraph.", "Cal AI, Airbnb"],
];

const MANROPE = FONTS.find((f) => f.id === "manrope")!.css;

export default function BrandKit() {
  return (
    <div className={`sg ${FONT_VARS}`} data-surface="sidestash" style={{ "--sans": MANROPE, "--display": MANROPE } as React.CSSProperties}>
      <SurfaceToggle fonts={FONTS.map(({ id, label, css }) => ({ id, label, css }))} initialFont="manrope" />
      <div className="wrap">
        <header className="hero">
          <span className="draft-tag"><span className="dot" /> Draft design system, for review</span>
          <div className="wordmark">Slug<em>Grub</em></div>
          <p className="lede">UCSC dining, ranked by students. UC Santa Cruz blue and gold on cool white, the system sans, food photos front and center, one big number per screen.</p>
        </header>

        <section style={{ marginTop: 0, marginBottom: 72 }}>
          <div className="eyebrow">Fonts</div>
          <h2 className="sec">Pick a font</h2>
          <p className="note">Ten modern sans options, each showing a headline, numbers and body text. Tap one to put it on every screen below, or use the Font menu at the top.</p>
          <div className="fonts">
            {FONTS.map((f) => (<FontCard key={f.id} id={f.id} label={f.label} css={f.css} note={f.note} />))}
          </div>
        </section>

        <section style={{ marginTop: 0 }}>
          <div className="eyebrow">Screens</div>
          <h2 className="sec">How it looks in the app</h2>
          <p className="note">Scroll inside Today and Halls to see the iOS-style edges: content blurs progressively and fades as it slides under the status bar and the tab bar.</p>
          <div className="phones">
            <Phone label="Today" tab="today" wash><TodayScreen /></Phone>
            <Phone label="Halls" tab="halls"><HallsScreen /></Phone>
            <Phone label="Rank (this or that)" tab="rank"><RankScreen /></Phone>
            <Phone label="Photo log result" footer={<div className="float-cta"><button className="btn btn-primary btn-block btn-lg" type="button">Save to today</button></div>}><PhotoScreen /></Phone>
            <Phone label="Budget" tab="budget"><BudgetScreen /></Phone>
            <Phone label="Leaderboard" tab="rank"><LeaderboardScreen /></Phone>
            <Phone label="Live QR vote"><VoteScreen /></Phone>
          </div>
        </section>

        <section>
          <div className="eyebrow">What makes it feel premium</div>
          <h2 className="sec">Twelve patterns from the best apps</h2>
          <p className="note">These showed up again and again across Cal AI, Beli, Airbnb, Copilot, Partiful, Crouton, Jomo, Opal and Revolut on Mobbin. Every screen above follows all twelve.</p>
          <div className="patterns">
            {PATTERNS.map(([t, d, src]) => (
              <div className="card" key={t}><b>{t}</b><p>{d}</p><span>Seen in {src}</span></div>
            ))}
          </div>
        </section>

        <section>
          <div className="eyebrow">Motion</div>
          <h2 className="sec">Smooth, quiet, and only where it helps</h2>
          <p className="note">One spring and one easing for everything, so every motion feels like the same app. Things slide instead of jumping, taps give a small press, numbers count up once, and the gooey effect appears in exactly one place: the camera button, where actions split off and merge back. Try them here and on the screens above.</p>
          <div className="grid2">
            <div className="card stack" style={{ justifyItems: "start" }}>
              <div className="eyebrow">Gooey camera menu (tap it)</div>
              <div style={{ height: 150, width: "100%", display: "grid", placeItems: "end center", paddingBottom: 8 }}><CameraMenu /></div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Sliding selection</div>
              <Seg options={["Breakfast", "Lunch", "Dinner", "Late"]} initial="Dinner" start />
              <Seg options={["Halls", "Dishes", "Colleges"]} initial="Dishes" start />
            </div>
            <div className="card stack">
              <div className="eyebrow">Numbers count up once</div>
              <div className="hero-num"><CountUp to={1120} /><small>pts</small></div>
            </div>
            <div className="card stack">
              <div className="eyebrow">The rules</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink-2)", lineHeight: 1.6, fontSize: 14 }}>
                <li>Press: buttons shrink to 97%, icon buttons to 90%, cards to 98.5%, in 140ms</li>
                <li>Slide and settle: one spring (stiffness 420, damping 36), no bounce you can count</li>
                <li>Only opacity, scale and position animate, so it stays smooth on phones</li>
                <li>Reduce motion turns every animation into an instant change</li>
                <li>No confetti, no shaking, no looping animation</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="eyebrow">Color</div>
          <h2 className="sec">UCSC blue and gold, cool grays</h2>
          <p className="note">Blue does the work: buttons, the camera button, the brand. Gold is rare: the #1 dish and a highlight. Everything else is cool gray and white.</p>
          <div className="swatches">
            {SWATCHES.map(([n, v, use]) => (
              <div className="sw" key={v}>
                <div className="chipc" style={{ background: `var(${v})`, boxShadow: "inset 0 -1px 0 var(--line)" }} />
                <div className="meta"><b>{n}</b><span style={{ color: "var(--ink-2)" }}>{use}</span><code>{v}</code></div>
              </div>
            ))}
          </div>
          <div className="eyebrow" style={{ margin: "28px 0 10px" }}>SlugGrub Blue, 12 steps (a brighter UCSC blue, generated and contrast checked)</div>
          <div className="scale">
            {SCALE.map((i) => (<div key={i} style={{ background: `var(--p${i})`, color: i >= 9 ? "var(--p1)" : "var(--p12)" }}>{i}</div>))}
          </div>
          <div className="eyebrow" style={{ margin: "28px 0 10px" }}>College colors (rivalry board only)</div>
          <div className="wrapflex">{COLLEGES.map(([n, v]) => (<span key={v} className="chip on" style={{ background: `var(${v})` }}>{n}</span>))}</div>
        </section>

        <section>
          <div className="eyebrow">Type</div>
          <h2 className="sec">One family: the system sans</h2>
          <p className="note">SF Pro on iPhone and Mac, the platform sans elsewhere. It loads instantly and feels native. Big things are bold with tight tracking, small things are regular and gray. Numbers use tabular figures. Nothing is ever all caps.</p>
          <div>
            <div className="type-row"><div className="meta">Display 56 / bold, tight</div><div className="display" style={{ fontSize: 56, lineHeight: 1 }}>Chicken Tikka Masala</div></div>
            <div className="type-row"><div className="meta">Title 30 / bold, tight</div><div className="title-xl">Which was better?</div></div>
            <div className="type-row"><div className="meta">Hero number 56 / bold</div><div className="hero-num">1,120<small>pts</small></div></div>
            <div className="type-row"><div className="meta">Heading 17 / semibold</div><div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>Best tonight</div></div>
            <div className="type-row"><div className="meta">Body 15 / regular</div><div style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink-2)", maxWidth: "60ch" }}>Tap the one you liked more. Every pick moves dishes up or down this week&apos;s leaderboard, and your calories stay on your phone.</div></div>
            <div className="type-row"><div className="meta">Label 13 / medium, gray</div><div className="eyebrow">Dinner · open till 8 PM</div></div>
          </div>
        </section>

        <section>
          <div className="eyebrow">Components</div>
          <h2 className="sec">The building blocks</h2>
          <div className="grid2">
            <div className="card stack">
              <div className="eyebrow">Buttons</div>
              <div className="wrapflex">
                <button className="btn btn-primary btn-lg" type="button">Save to today</button>
                <button className="btn btn-primary btn-lg" type="button"><I icon={Camera01Icon} size={19} sw={2} /> Log a plate</button>
              </div>
              <div className="wrapflex">
                <button className="btn btn-secondary" type="button">See menu</button>
                <button className="btn btn-ghost" type="button">Skip</button>
                <div className="iconbtn"><I icon={ArrowLeft01Icon} size={18} /></div>
                <div className="iconbtn"><I icon={MoreHorizontalIcon} size={18} /></div>
              </div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Pills, chips and changes</div>
              <div className="wrapflex">
                <span className="pill ok"><span className="dot" />On track</span>
                <span className="pill warn"><span className="dot" />Spending fast</span>
                <span className="delta up"><I icon={ArrowUp01Icon} size={12} sw={2.4} />12</span>
                <span className="delta down"><I icon={ArrowDown01Icon} size={12} sw={2.4} />2</span>
              </div>
              <div className="wrapflex">
                <span className="tint blue"><I icon={Location01Icon} size={14} sw={2} /> JRL/C9</span>
                <span className="tint blue"><I icon={Clock01Icon} size={14} sw={2} /> Open till 8</span>
                <span className="tint gold"><I icon={CrownIcon} size={14} sw={2} /> #1 tonight</span>
              </div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Dish card</div>
              <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "none" }}>
                <Photo food="poke" w="100%" h={140} r={0}><span className="on-photo"><I icon={StarIcon} size={12} sw={2.2} color="var(--y11)" />8.9</span></Photo>
                <div style={{ padding: "10px 12px 12px" }}><b style={{ letterSpacing: "-0.01em" }}>Salmon Poke Bowl</b><div className="num" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>480 cal · Crown/Merrill</div></div>
              </div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Onboarding chips</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1 }}>Which college are you in?</div>
              <div className="wrapflex">
                <span className="chip">Cowell</span>
                <span className="chip on" style={{ background: "var(--p9)" }}>Porter</span>
                <span className="chip">Crown</span>
                <span className="chip">Oakes</span>
                <span className="chip">College Nine</span>
              </div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Segmented control and macro bar</div>
              <Seg options={["This week", "Today", "All time"]} initial="This week" start />
              <div className="macro"><i style={{ flex: 38, background: "var(--protein)" }} /><i style={{ flex: 44, background: "var(--carbs)" }} /><i style={{ flex: 30, background: "var(--fat)" }} /></div>
              <div className="legend"><span><b style={{ background: "var(--protein)" }} />Protein</span><span><b style={{ background: "var(--carbs)" }} />Carbs</span><span><b style={{ background: "var(--fat)" }} />Fat</span></div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Hero number</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="iconbtn" style={{ width: 48, height: 48, background: "var(--paper-2)", border: 0 }}><I icon={FireIcon} size={22} sw={2} /></div>
                <div className="hero-num">540<small>cal</small></div>
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)" }}>One per screen. Units smaller and gray, one short line of context.</div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Icons (Hugeicons, stroke rounded)</div>
              <div className="wrapflex" style={{ gap: 16 }}>
                {[Home09Icon, ChampionIcon, Restaurant01Icon, Wallet01Icon, Camera01Icon, Search01Icon, FireIcon, CrownIcon, SparklesIcon, QrCodeIcon].map((ic, i) => (<I key={i} icon={ic} size={24} />))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="eyebrow">Shape and space</div>
          <h2 className="sec">Soft corners, room to breathe</h2>
          <div className="grid2">
            <div className="card stack">
              <div className="eyebrow">Radius</div>
              <div className="wrapflex">
                {[["12", "--r-sm", "inputs, thumbnails"], ["22", "--r-md", "cards, photos"], ["28", "--r-lg", "big cards, sheets"], ["pill", "--r-pill", "buttons, chips"]].map(([n, v, u]) => (
                  <div key={v} style={{ display: "grid", gap: 6, justifyItems: "center", fontSize: 12, color: "var(--ink-2)", textAlign: "center", maxWidth: 80 }}>
                    <div style={{ width: 64, height: 64, background: "var(--p4)", borderRadius: `var(${v})` }} />
                    <b style={{ color: "var(--ink)" }}>{n}</b>{u}
                  </div>
                ))}
              </div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Spacing (4px base)</div>
              {[4, 8, 12, 16, 24, 32].map((n) => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }} className="num">
                  <span style={{ width: 28, color: "var(--ink-3)" }}>{n}</span><div className="spacing-bar" style={{ width: n * 4 }} />
                </div>
              ))}
            </div>
            <div className="card stack">
              <div className="eyebrow">Elevation</div>
              <div className="wrapflex">
                <div style={{ width: 90, height: 64, borderRadius: 16, border: "1px solid var(--line)", display: "grid", placeItems: "center", fontSize: 12 }}>flat</div>
                <div style={{ width: 90, height: 64, borderRadius: 16, background: "var(--card)", border: "1px solid var(--line)", boxShadow: "var(--shadow-1)", display: "grid", placeItems: "center", fontSize: 12 }}>card</div>
                <div style={{ width: 90, height: 64, borderRadius: 16, background: "var(--card)", boxShadow: "var(--shadow-2)", display: "grid", placeItems: "center", fontSize: 12 }}>floating</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="eyebrow">Rules</div>
          <h2 className="sec">Do and don&apos;t</h2>
          <div className="dodont">
            <div className="card"><b>Do</b><ul>
              <li>One hero number per screen, everything else quieter</li>
              <li>Let the food photo carry the screen</li>
              <li>Blue for actions and the camera, gold only for #1</li>
              <li>Say what&apos;s good in plain words: &quot;Best tonight&quot;</li>
              <li>Keep calories private and say so on the photo result</li>
            </ul></div>
            <div className="card"><b>Don&apos;t</b><ul>
              <li>All-caps text: labels and headings stay sentence case</li>
              <li>Gray lists with no photos, tables of tiny numbers</li>
              <li>Flat tab bars, full-width rectangle buttons, centered nav titles</li>
              <li>Mascots, confetti, emoji as icons, more than one icon style</li>
              <li>Anything that ranks people by eating less</li>
            </ul></div>
          </div>
        </section>
      </div>
    </div>
  );
}
