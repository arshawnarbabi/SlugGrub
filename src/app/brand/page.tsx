// Owner: Arshawn. Brand kit preview of the DRAFT design system (docs/DESIGN.md, # draft until approved).
// Mock data only. Not linked from the tab bar.

import type { Metadata } from "next";
import {
  Camera, Home, Trophy, Utensils, Wallet, Swords, Undo2, ChevronRight, ArrowUp, ArrowDown,
  Sparkles, MapPin, Clock, Minus, Plus, Wifi, BatteryFull, Signal,
} from "lucide-react";
import "./brand.css";

export const metadata: Metadata = { title: "SlugGrub brand kit" };

type PlateKind = "curry" | "pesto" | "pizza" | "thai" | "burrito";
function Plate({ kind, size = 72 }: { kind: PlateKind; size?: number }) {
  return <div className={`plate ${kind}`} style={{ width: size, height: size }} aria-hidden />;
}

function Status() {
  return (
    <div className="status num">
      <span>6:41</span>
      <span style={{ display: "flex", gap: 5 }}><Signal size={13} /><Wifi size={13} /><BatteryFull size={15} /></span>
    </div>
  );
}

function TabBar({ active }: { active: "today" | "rank" | "halls" | "budget" | "none" }) {
  const tabs = [
    { id: "today", label: "Today", Icon: Home },
    { id: "rank", label: "Rank", Icon: Trophy },
    { id: "halls", label: "Halls", Icon: Utensils },
    { id: "budget", label: "Budget", Icon: Wallet },
  ] as const;
  return (
    <div className="tabbar">
      <div className="pillbar">
        {tabs.map(({ id, label, Icon }) => (
          <div key={id} className={`tab ${active === id ? "on" : ""}`}><Icon size={20} strokeWidth={active === id ? 2.4 : 1.8} />{label}</div>
        ))}
      </div>
      <div className="cam" aria-label="Log a plate"><Camera size={24} strokeWidth={2} /></div>
    </div>
  );
}

function Phone({ label, children, tab }: { label: string; children: React.ReactNode; tab: Parameters<typeof TabBar>[0]["active"] }) {
  return (
    <div className="phone-col">
      <div className="phone">
        <Status />
        <div className="screen">{children}</div>
        {tab !== "none" && <TabBar active={tab} />}
      </div>
      <div className="phone-label">{label}</div>
    </div>
  );
}

/* ───────── mock screens ───────── */

function TodayScreen() {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="pill neutral"><Clock size={12} /> Dinner · open till 8 PM</span>
        <span className="pill neutral"><MapPin size={12} /> JRL/C9</span>
      </div>
      <div className="display" style={{ fontSize: 30, lineHeight: 1.05 }}>Good evening,<br /><em>Maya</em></div>

      <div className="card" style={{ display: "grid", gap: 10 }}>
        <div className="eyebrow">Top pick right now</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Plate kind="curry" size={78} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display" style={{ fontSize: 18, lineHeight: 1.15, letterSpacing: "-0.02em" }}>Chicken Tikka Masala</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }} className="num">540 cal · 1 cup · #1 at your hall</div>
          </div>
          <div className="score top num">9.1</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 6, borderTop: "1px solid var(--line)", paddingTop: 9 }}>
          <Sparkles size={13} color="var(--p9)" /> Best on campus: <b>Pesto Pasta</b> at Cowell
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="eyebrow">This week</div>
          {[["1", "Crown", "var(--c-crown)"], ["2", "Cowell", "var(--c-cowell)"], ["3", "Porter", "var(--c-porter)"]].map(([n, h, c]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, marginTop: 7 }} className="num">
              <span style={{ width: 8, height: 8, borderRadius: 9, background: c }} /> <b>{n}</b> {h}
              {n === "3" && <ArrowUp size={12} color="var(--ok)" />}
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="eyebrow">Slug Points</div>
          <div className="num" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 6 }}>1,120</div>
          <div style={{ height: 6, background: "var(--paper-2)", borderRadius: 9, marginTop: 6, overflow: "hidden" }}>
            <div style={{ width: "58%", height: "100%", background: "var(--p9)", borderRadius: 9 }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--ok)", marginTop: 6, fontWeight: 600 }}>On pace · 27 days</div>
        </div>
      </div>

      <div className="card green" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Swords size={18} />
        <div style={{ flex: 1, fontSize: 13 }}><b>Which was better at lunch?</b><div style={{ opacity: 0.75, fontSize: 12 }}>Pad Thai or the burrito</div></div>
        <ChevronRight size={18} />
      </div>
    </>
  );
}

function RankScreen() {
  return (
    <>
      <div className="eyebrow" style={{ marginTop: 8 }}>Lunch at JRL/C9</div>
      <div className="display" style={{ fontSize: 30, lineHeight: 1.05 }}>Which was <em>better?</em></div>
      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>Tap the one you liked more. It moves up the leaderboard.</div>
      <div className="duel" style={{ marginTop: 10 }}>
        <div className="opt picked">
          <Plate kind="thai" size={100} />
          <div className="display" style={{ fontSize: 16, lineHeight: 1.15, letterSpacing: "-0.02em" }}>Pad Thai</div>
          <div className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>410 cal · #4</div>
        </div>
        <div className="or">or</div>
        <div className="opt">
          <Plate kind="burrito" size={100} />
          <div className="display" style={{ fontSize: 16, lineHeight: 1.15, letterSpacing: "-0.02em" }}>Bean &amp; Cheese Burrito</div>
          <div className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>520 cal · #9</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>
        <span style={{ display: "flex", gap: 5, alignItems: "center" }}><Undo2 size={14} /> Undo</span>
        <span>Too tough</span>
        <span>Skip</span>
      </div>
      <div className="card flat" style={{ marginTop: "auto", fontSize: 12, color: "var(--ink-2)", display: "flex", gap: 8, alignItems: "center" }}>
        <span className="pill ok"><span className="dot" />+12</span> Pad Thai climbed to <b style={{ color: "var(--ink)" }}>#3</b> at JRL/C9
      </div>
    </>
  );
}

function PhotoScreen() {
  return (
    <>
      <div style={{ background: "var(--paper-2)", borderRadius: "var(--r-lg)", height: 170, display: "grid", placeItems: "center", marginTop: 4 }}>
        <Plate kind="curry" size={150} />
      </div>
      <div className="eyebrow">Dinner · JRL/C9 · only you can see this</div>
      <div className="hero-num">830<small>cal</small></div>
      <div className="macro"><i style={{ flex: 38, background: "var(--protein)" }} /><i style={{ flex: 44, background: "var(--carbs)" }} /><i style={{ flex: 30, background: "var(--fat)" }} /></div>
      <div className="legend num"><span><b style={{ background: "var(--protein)" }} />Protein 38g</span><span><b style={{ background: "var(--carbs)" }} />Carbs 44g</span><span><b style={{ background: "var(--fat)" }} />Fat 30g</span></div>
      <div className="card" style={{ padding: "4px 12px" }}>
        {[["Chicken Tikka Masala", "1.5 servings", "810"], ["Steamed Jasmine Rice", "1 serving", "120"]].slice(0, 2).map(([n, s, c]) => (
          <div className="row" key={n}>
            <div className="grow"><div className="title">{n}</div><div className="sub num">{s} · {c} cal</div></div>
            <div style={{ display: "flex", gap: 6 }}>
              <span className="pill neutral" style={{ width: 26, padding: 0, justifyContent: "center" }}><Minus size={12} /></span>
              <span className="pill neutral" style={{ width: 26, padding: 0, justifyContent: "center" }}><Plus size={12} /></span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Something look off? <b style={{ color: "var(--p9)" }}>Fix it</b></div>
      <button className="btn btn-primary btn-block" type="button">Save to today</button>
    </>
  );
}

function BudgetScreen() {
  // arc: 270 degrees, 58% used of the quarter pace
  const r = 92, c = 2 * Math.PI * r, arc = c * 0.75, filled = arc * 0.58;
  return (
    <>
      <div className="eyebrow" style={{ marginTop: 8 }}>Slug Points · Gold plan</div>
      <div style={{ position: "relative", height: 210, display: "grid", placeItems: "center" }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: "absolute", transform: "rotate(135deg)" }} aria-hidden>
          <circle cx="110" cy="110" r={r} fill="none" stroke="var(--paper-2)" strokeWidth="14" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
          <circle cx="110" cy="110" r={r} fill="none" stroke="var(--p9)" strokeWidth="14" strokeDasharray={`${filled} ${c}`} strokeLinecap="round" />
        </svg>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <div className="hero-num" style={{ fontSize: 50 }}>1,120</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>points left</div>
          <span className="pill ok" style={{ marginTop: 8 }}><span className="dot" />On track</span>
        </div>
      </div>
      <div className="num" style={{ textAlign: "center", fontSize: 13, color: "var(--ink-2)", marginTop: -8 }}>41 pts a day · 27 days left · 0 to spare</div>
      <div className="card" style={{ padding: 12 }}>
        <div className="eyebrow">Spending vs ideal pace</div>
        <svg viewBox="0 0 240 70" width="100%" height="70" aria-hidden style={{ marginTop: 6 }}>
          <line x1="4" y1="64" x2="236" y2="8" stroke="var(--ink-3)" strokeDasharray="4 4" strokeWidth="1.5" />
          <polyline points="4,64 40,58 76,47 112,40 148,33" fill="none" stroke="var(--p9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="148" cy="33" r="4" fill="var(--p9)" />
        </svg>
      </div>
      <div className="card" style={{ padding: "4px 12px" }}>
        {[["Dining halls", "620"], ["Cafes", "180"], ["Markets", "85"]].map(([n, v]) => (
          <div className="row" key={n}><div className="grow title">{n}</div><div className="num" style={{ fontWeight: 600 }}>{v}</div></div>
        ))}
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
      <div className="seg" style={{ alignSelf: "start", marginTop: 6 }}><span className="on">Halls</span><span>Dishes</span><span>Colleges</span></div>
      <div className="eyebrow">Week of Nov 10</div>
      <div className="display" style={{ fontSize: 28, lineHeight: 1.05 }}>Porter is <em>#3</em><br />and climbing</div>
      <div className="card" style={{ padding: "4px 12px" }}>
        {rows.map(([n, h, c, s, ch]) => (
          <div className={`row ${h.startsWith("Porter") ? "me" : ""}`} key={n}>
            <span className="rank-n">{n}</span>
            <span style={{ width: 10, height: 28, borderRadius: 9, background: c }} />
            <div className="grow"><div className="title">{h}</div><div className="sub num">{s} pts</div></div>
            {ch > 0 && <span className="pill ok"><ArrowUp size={11} />{ch}</span>}
            {ch < 0 && <span className="pill bad"><ArrowDown size={11} />{-ch}</span>}
            {ch === 0 && <span className="pill neutral">same</span>}
          </div>
        ))}
      </div>
    </>
  );
}

function VoteScreen() {
  return (
    <>
      <div className="eyebrow" style={{ marginTop: 8 }}>Live at DevFest · 214 votes</div>
      <div className="display" style={{ fontSize: 28, lineHeight: 1.05 }}>Dish of the week,<br /><em>final round</em></div>
      <div className="vote">
        <div className="blk" style={{ background: "var(--p9)", minHeight: 170 }}>
          <div><div className="display" style={{ fontSize: 20 }}>Pesto Pasta</div><div style={{ fontSize: 12, opacity: 0.8 }}>Cowell/Stevenson</div></div>
          <div className="num" style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em" }}>62%</div>
        </div>
        <div className="blk" style={{ background: "var(--y9)", color: "var(--ink)", minHeight: 110 }}>
          <div><div className="display" style={{ fontSize: 20 }}>Pad Thai</div><div style={{ fontSize: 12, opacity: 0.7 }}>JRL/C9</div></div>
          <div className="num" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em" }}>38%</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", textAlign: "center" }}>Scan the code on screen to vote</div>
    </>
  );
}

/* ───────── page ───────── */

const GREEN = Array.from({ length: 12 }, (_, i) => i + 1);
const SWATCHES: [string, string, string][] = [
  ["Mist", "--paper", "Page background"],
  ["Card", "--card", "Raised surfaces"],
  ["Ink", "--ink", "Main text"],
  ["UCSC Blue", "--p9", "Brand, primary action"],
  ["UCSC Gold", "--y9", "#1 dish, highlights"],
  ["On track", "--ok", "Good status"],
  ["Heads up", "--warn", "Spending fast"],
  ["Off track", "--bad", "Over budget, drops"],
];
const COLLEGES: [string, string][] = [["JRL/C9", "--c-jrl"], ["Cowell/Stevenson", "--c-cowell"], ["Crown/Merrill", "--c-crown"], ["Porter/Kresge", "--c-porter"], ["Carson/Oakes", "--c-oakes"]];

export default function BrandKit() {
  return (
    <div className="sg">
      <div className="wrap">
        <header className="hero">
          <span className="draft-tag"><span className="dot" /> Draft design system, for review</span>
          <div className="wordmark">Slug<em>Grub</em></div>
          <p className="lede">UCSC dining, ranked by students. UC Santa Cruz blue and gold, cool grays, the system sans, one big number per screen.</p>
        </header>

        <section style={{ marginTop: 0 }}>
          <div className="eyebrow">Screens</div>
          <h2 className="sec">How it looks in the app</h2>
          <div className="phones">
            <Phone label="Today" tab="today"><TodayScreen /></Phone>
            <Phone label="Rank (this or that)" tab="rank"><RankScreen /></Phone>
            <Phone label="Photo log result" tab="none"><PhotoScreen /></Phone>
            <Phone label="Budget" tab="budget"><BudgetScreen /></Phone>
            <Phone label="Leaderboard" tab="rank"><LeaderboardScreen /></Phone>
            <Phone label="Live QR vote" tab="none"><VoteScreen /></Phone>
          </div>
        </section>

        <section>
          <div className="eyebrow">Color</div>
          <h2 className="sec">UCSC blue and gold, cool grays</h2>
          <p className="note">Blue does the work (buttons, the camera button, the brand). Gold is rare: the #1 dish and a highlight. Everything else is cool gray and white, like Cal AI. Status colors only mean status. College colors appear only on the rivalry board.</p>
          <div className="swatches">
            {SWATCHES.map(([n, v, use]) => (
              <div className="sw" key={v}>
                <div className="chipc" style={{ background: `var(${v})`, boxShadow: "inset 0 -1px 0 var(--line)" }} />
                <div className="meta"><b>{n}</b><span style={{ color: "var(--ink-2)" }}>{use}</span><code>{v}</code></div>
              </div>
            ))}
          </div>
          <div className="eyebrow" style={{ margin: "28px 0 10px" }}>UCSC Blue, 12 steps (generated from #003C6C, contrast checked)</div>
          <div className="scale">
            {GREEN.map((i) => (
              <div key={i} style={{ background: `var(--p${i})`, color: i >= 9 ? "var(--p1)" : "var(--p12)" }}>{i}</div>
            ))}
          </div>
          <div className="eyebrow" style={{ margin: "28px 0 10px" }}>College colors (rivalry board only)</div>
          <div className="wrapflex">
            {COLLEGES.map(([n, v]) => (
              <span key={v} className="chip on" style={{ background: `var(${v})` }}>{n}</span>
            ))}
          </div>
        </section>

        <section>
          <div className="eyebrow">Type</div>
          <h2 className="sec">One family: the system sans</h2>
          <p className="note">SF Pro on iPhone and Mac (the system font, so it loads instantly and feels native), with the platform sans elsewhere. Headlines are bold with tight tracking; body text is regular. Numbers always use tabular figures so they line up.</p>
          <div>
            <div className="type-row"><div className="meta">Display 56 / bold, tight</div><div className="display" style={{ fontSize: 56, lineHeight: 1 }}>Chicken Tikka <em>Masala</em></div></div>
            <div className="type-row"><div className="meta">Title 30 / bold, tight</div><div className="display" style={{ fontSize: 30 }}>Which was better?</div></div>
            <div className="type-row"><div className="meta">Hero number 56 / semibold</div><div className="hero-num">1,120<small>pts</small></div></div>
            <div className="type-row"><div className="meta">Heading 20 / semibold</div><div style={{ fontSize: 20, fontWeight: 600 }}>Top pick right now</div></div>
            <div className="type-row"><div className="meta">Body 15 / regular</div><div style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink-2)", maxWidth: "60ch" }}>Tap the one you liked more. Every pick moves dishes up or down this week&apos;s leaderboard, and your calories never leave your phone.</div></div>
            <div className="type-row"><div className="meta">Label 13 / medium, gray</div><div className="eyebrow">Dinner · open till 8 PM</div></div>
          </div>
        </section>

        <section>
          <div className="eyebrow">Components</div>
          <h2 className="sec">The building blocks</h2>
          <div className="grid2">
            <div className="card stack">
              <div className="eyebrow">Buttons (pill)</div>
              <div className="wrapflex">
                <button className="btn btn-primary" type="button">Save to today</button>
                <button className="btn btn-accent" type="button"><Camera size={18} /> Log a plate</button>
              </div>
              <div className="wrapflex">
                <button className="btn btn-secondary" type="button">See menu</button>
                <button className="btn btn-ghost" type="button">Skip</button>
                <button className="btn btn-primary btn-sm" type="button">Vote</button>
              </div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Status pills and score badges</div>
              <div className="wrapflex">
                <span className="pill ok"><span className="dot" />On track</span>
                <span className="pill warn"><span className="dot" />Spending fast</span>
                <span className="pill bad"><ArrowDown size={11} />2</span>
                <span className="pill neutral"><Clock size={12} /> Open till 8</span>
              </div>
              <div className="wrapflex"><div className="score top num">9.1</div><div className="score num">8.4</div><div className="score num">7.2</div></div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Onboarding chips</div>
              <div className="display" style={{ fontSize: 24, lineHeight: 1.1 }}>Which college are you in?</div>
              <div className="wrapflex">
                <span className="chip">Cowell</span>
                <span className="chip on" style={{ background: "var(--c-porter)" }}>Porter</span>
                <span className="chip">Crown</span>
                <span className="chip">Oakes</span>
                <span className="chip">College Nine</span>
              </div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Segmented control</div>
              <div className="seg"><span className="on">This week</span><span>Today</span><span>All time</span></div>
              <div className="eyebrow" style={{ marginTop: 8 }}>Macro bar</div>
              <div className="macro"><i style={{ flex: 38, background: "var(--protein)" }} /><i style={{ flex: 44, background: "var(--carbs)" }} /><i style={{ flex: 30, background: "var(--fat)" }} /></div>
              <div className="legend"><span><b style={{ background: "var(--protein)" }} />Protein</span><span><b style={{ background: "var(--carbs)" }} />Carbs</span><span><b style={{ background: "var(--fat)" }} />Fat</span></div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Dish row</div>
              <div className="row" style={{ paddingTop: 0 }}>
                <Plate kind="pesto" size={48} />
                <div className="grow"><div className="title">Pesto Pasta</div><div className="sub num">480 cal · Cowell/Stevenson</div></div>
                <div className="score num">8.8</div>
              </div>
              <div className="row">
                <Plate kind="pizza" size={48} />
                <div className="grow"><div className="title">Cheese Pizza</div><div className="sub num">290 cal · every hall, always</div></div>
                <div className="score num">7.6</div>
              </div>
            </div>
            <div className="card stack">
              <div className="eyebrow">Hero number</div>
              <div className="hero-num">540<small>cal</small></div>
              <div style={{ fontSize: 13, color: "var(--ink-2)" }}>One per screen. Units and decimals smaller and gray, a short line of context underneath.</div>
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
                {[["12", "--r-sm", "inputs"], ["20", "--r-md", "cards"], ["28", "--r-lg", "big cards, sheets"], ["pill", "--r-pill", "buttons, chips"]].map(([n, v, u]) => (
                  <div key={v} style={{ display: "grid", gap: 6, justifyItems: "center", fontSize: 12, color: "var(--ink-2)" }}>
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
                <div style={{ width: 90, height: 64, borderRadius: 16, background: "var(--card)", boxShadow: "var(--shadow-1)", display: "grid", placeItems: "center", fontSize: 12 }}>card</div>
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
              <li>Say what&apos;s good in plain words: &quot;Best on campus: Pesto Pasta&quot;</li>
              <li>Keep calories private and say so on the photo result</li>
            </ul></div>
            <div className="card"><b>Don&apos;t</b><ul>
              <li>Gray lists with no photos</li>
              <li>Default blue, flat tab bars, full-width rectangle buttons</li>
              <li>Donut charts with legends, tables of tiny numbers</li>
              <li>Mascots, confetti, emoji as icons</li>
              <li>All-caps text: labels and headings stay sentence case</li>
              <li>Anything that ranks people by eating less</li>
            </ul></div>
          </div>
        </section>
      </div>
    </div>
  );
}
