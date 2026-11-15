---
# ─────────────────────────────────────────────────────────────
# DECISIONS_TEMPLATE.md — Decision log (append-only; AI-maintained)
# Version: 1.23.1
# Scope: any project. The short record of WHY the locked choices are locked, so a
#        fresh agent (or teammate) doesn't relitigate settled decisions next session.
# Companions: PROJECT.md (the contract rule that says to read + append here).
#
# WHAT THIS FILE IS:
# A lightweight ADR (Architecture Decision Record) log, adapted for agentic work.
# Every non-trivial, locked decision — a color direction, a framework, a positioning
# call, "we deliberately are NOT doing X" — gets one append-only entry with its
# rationale. Without it, each new session re-asks questions the human already answered.
#
# HOW TO USE:
# 1. Copy this file to your project as `DECISIONS.md` and delete the example entry.
# 2. The AI APPENDS an entry whenever a decision is locked (never edits past entries;
#    to reverse one, append a NEW entry that supersedes it and link back).
# 3. The AI READS this file before proposing changes — settled choices stay settled
#    unless the human explicitly reopens them.
# ─────────────────────────────────────────────────────────────

# ─── STATUS MARKERS — every value's state stays trackable (authoritative spec: PROJECT.md → §Status protocol) ───
# An inline comment on a value marks its state; unmarked + filled = "given" (the user's own input).
#   <slot>/<TBD> = unfilled · # draft = AI-inferred, needs approval · # default = out-of-box default,
#   not consciously chosen · # approved = signed off · # locked = approved + logged in DECISIONS.md.
# Rule: the AI never writes an inferred value without `# draft`, nor accepts a default without `# default`
# — so an unmarked filled value is, by construction, the user's. Nothing fabricated slips through unverified.

template_version: "1.23.1"
file_role: "decisions"   # information | design | spec | project | content | seo | qa | decisions

# Append-only. Newest entry at the top. One entry per locked, non-trivial decision.
# Format per entry (keep it tight — this is a log, not an essay):
#
#   ## YYYY-MM-DD — <short decision title>
#   - **Context:** <what prompted the decision; constraints in play>
#   - **Options considered:** <the real alternatives, briefly>
#   - **Choice:** <what was decided>
#   - **Rationale:** <why this option won>
#   - **Consequences:** <what this commits us to / rules out; revisit triggers>
#   - **Status:** locked   # locked | superseded by <date entry> | revisited
#
# Two TYPED entries have extra required fields (examples in the body):
#   Viewport scope    — a size/class removed from QA.md gates.viewport_matrix → `out_of_scope`.
#                       + **Scope:** which sizes · **Covered by:** what the user sees there instead.
#   Performance trade — an effect shipped below its intended tier because the runtime budget failed.
#                       + **Effect / Tier chosen / Measured / Cheaper path looks like** (numbers required).
---

# Decision log

Append-only record of locked, non-trivial decisions and why. A fresh agent reads this **before** proposing changes so it doesn't reopen settled choices. To reverse a decision, append a **new** entry that supersedes the old one (mark the old one `superseded by <date>`) — never rewrite history.

What belongs here: choices that were genuinely decided and would be costly or confusing to relitigate — a brand/color direction, a framework or platform call, a positioning stance, a scope boundary ("we are deliberately **not** building X"), a naming convention. What doesn't: routine slot-filling already captured in the other templates.

## Example entry (delete in your project)

## 2026-05-30 — Surface separation via borders, not shadows
- **Context:** Cards/panels needed a clear separation strategy; the design system supports shadow / border / surface-tone.
- **Options considered:** soft shadow (default), 1px border, raised surface tone.
- **Choice:** 1px border separation (`surface_separation.strategy: border`).
- **Rationale:** Reads cleaner and flatter for a calm, trustworthy product feel; avoids the "floating SaaS card" look.
- **Consequences:** Components author borders not shadows; dark mode uses a lightened border, not a drop shadow. Revisit only if the brand shifts toward a more dimensional aesthetic.
- **Status:** locked

## Entry types with required fields

Most entries use the plain format above. Two kinds of decision come up on every build and carry extra fields, because other files depend on them: QA.md only accepts a viewport in `out_of_scope` when a **Viewport scope** entry exists, and a failed runtime budget (QA Gate B2) is only resolved by a **Performance trade** entry. Title them with the type so they are greppable.

### Example: Viewport scope (delete in your project)

## 2026-05-30 — Viewport scope: phone landscape out of scope
- **Context:** The full-bleed hero and pinned gallery need more height than a phone held sideways has (375–430 px), and the audience browses in portrait.
- **Options considered:** a dedicated landscape layout; letting portrait layout run sideways; a rotate prompt.
- **Choice:** `phone_landscape` (667×375, 844×390, 932×430) goes in QA.md `gates.viewport_matrix.out_of_scope`.
- **Scope:** phones in landscape only (touch, height ≤ 500 px). Tablets in landscape stay IN scope.
- **Covered by:** a full-screen "rotate your phone" prompt over the site in that orientation; it is itself checked at all three sizes.
- **Rationale:** A landscape layout would double the hero work for a small share of visits; the prompt is honest and cheap.
- **Consequences:** Layout findings at those sizes are not filed. Revisit if analytics show landscape phone traffic above ~5%.
- **Status:** locked

### Example: Performance trade (delete in your project)

## 2026-05-30 — Performance trade: hero glass from live blur to pre-blurred image
- **Context:** The hero's frosted-glass panel used `backdrop-filter: blur(24px)` over a moving background (DESIGN `effects.registry` → `hero-glass`).
- **Effect:** `hero-glass`, intended tier: live backdrop-filter.
- **Measured:** p95 frame time 13.2 ms on iPhone 15 Pro at 120 Hz (budget 8.3), 24.1 ms on a mid-tier Android at 60 Hz (budget 16.7), scrolling down and up. Both fail.
- **Tier chosen:** pre-blurred background image under a translucent fill, crossfaded on scroll with `opacity` only (compositor). Measured 6.9 ms / 12.4 ms on the same devices.
- **Cheaper path looks like:** the glass no longer refracts content scrolling beneath it; at rest it is visually identical. Reduced-motion: static panel, no crossfade.
- **Rationale:** The highest-quality version that meets the budget on both devices; the live blur failed on both.
- **Consequences:** Measured numbers recorded in the registry entry. Revisit only if a new device class is added to QA.md `runtime.devices`, with fresh measurements.
- **Status:** locked


# SlugGrub decisions

## 2026-11-14 — Surface: Flat + Sidestash
- **Context:** Compared Chalk, Flat, Stroke, Stroke + shadow, Sidestash and mixes on /brand.
- **Options:** all-flat; all-Sidestash; Sidestash with solid cards; flat with Sidestash on a few controls.
- **Choice:** his words: "lets do flat + sidestash as defauly ... make the nav bar button and the top bar buttons and the camera button sidestash style but everythign else is flat, like every other button and element is flat." Sidestash finish uses one gradient strength everywhere it appears ("anything sidestash for this version has the same default gradeint strength").
- **Rationale:** his taste call after seeing every option on the real screens; flat keeps food photos the loudest thing; the tactile finish marks the three controls you press most.
- **Consequences:** DESIGN.md surface, border, elevation and surface_separation reflect it; card and button rules must live in separate selectors (a shared :is() list caused a specificity bug on 2026-11-14).
- **Status:** locked

## 2026-11-14 — Page background: step 7 "Gray"
- **Choice:** oklch(0.948 0.004 250), his pick from 11 steps ("make 7 gray the background").
- **Status:** locked

## 2026-11-14 — Color, type, icons, case
- **Choice:** cool neutrals hue 250 ("coldish neutral colors"); a brighter UCSC-style blue, oklch(0.52 0.165 252) ("make het blue primary brighter quite a bit"); Manrope ("lets try manrope as defauly", trial); Hugeicons ("for icons we use hugeicons"); no all-caps text anywhere ("i dont wnat anything all caps text").
- **Status:** locked (Manrope as a trial; blue variant still comparable on /brand)

## 2026-11-14 — Motion and gooey
- **Choice:** smooth, premium, subtle micro-interactions, never gimmicky; gooey kept subtle and consistent; the gooey camera spring has "a bit more spring" than the library's smooth preset.
- **Status:** approved (exact spring values # draft in DESIGN.md motion)


## 2026-11-14 — Pages open static; presses dim
- **Choice:** his words: "dont animate the ui coming in on page selection, everything should be static" (supersedes the 180ms page crossfade tried earlier the same day) and "when pressing buttons just make it normal, no expand or compress". Motion is only for changes made on the screen.
- **Status:** locked

## 2026-11-14 — Sizing scale
- **Choice:** every tap target at least 44px; heights: nav bar and food button 62, primary buttons 52, top bar icon buttons 44, chips 42/40, segmented 36 in a 44 track, top bar tags 36, See all 32 (44 tap area). His ask: "make sure all the button sizes are appropriately sized relative to each other and the content".
- **Status:** approved (values # draft in DESIGN.md until he signs off)

## 2026-11-14 — App icon, card chevrons, launch splash
- **App icon:** the food button itself: the white Hugeicons rice bowl (stroke 1.9) on --p9 (#0069bf), glyph at 56% of the tile. His words: "keep it simple and just make it the food icon in teh blue button". Files: `src/app/icon.svg` (favicon), `src/app/apple-icon.png` (180, full bleed; iOS rounds it), `public/brand/sluggrub-icon-1024.png` and `-rounded-512.png` (Devpost, slides). Starter `favicon.ico` removed.
- **Clickable cards:** a right chevron at the top right. His words: "on clicable ui cards at a right chevron on the top right". Plain cards: ink-3 chevron; photo-topped cards: the chevron on a white chip like `.on-photo`. The Rank-your-lunch card's centered arrow button was replaced by the same chevron.
- **Launch splash (trial):** his idea after Trackify's heart burst: "what if we do that but wit han intial svg animation and then it fades out", since the line icon can't act as a mask. The icon tile on the page color, the bowl draws itself, then the layer fades off the app; about 1 s, once per full page load, never on tab changes (so "pages open static" still holds). Opacity-only on the full-screen layer; 4px blur on the 88px tile only (blur budget).
- **Status:** icon and chevrons approved; splash is a trial until he sees it on his phone
- **Amended 2026-11-14 (splash, his words):** "gaussian blur the app backgrond whil hte loading icon is animating in, and remove hte fill card behind it. when the icon fades out at the same time blur in the content at the same length". Now: no tile; the blue bowl draws over the real app under one 8px backdrop blur; at 760 ms the icon blur-fades out and the blur layer fades off over the same 300 ms. Blur budget exception, launch only: the radius stays fixed (opacity animates, never the radius), and for about 1 s it is a 7th backdrop layer over the 6 edge layers.
- **Amended 2026-11-14 (his words):** "make the blur during loading a bit heavier and make ht icon a bit bigger", "per the deisgn.md": splash blur 12px (written into DESIGN `effects.blur_budget.launch_splash_exception`, the only blur past 8px), bowl 80px.

## 2026-11-14 — Dish images: Gemini-generated, one per unique dish
- **Choice:** one Nano Banana 2.1 image per unique dish name on the 5 dining halls' menus, from the prompt in `docs/food-image-prompt.md` (his test of two filled prompts: "ok this works. generate them all now"). Generated by `scripts/food-images.mjs` into `public/food/gen/` with `index.json` mapping dish name to image.
- **Options considered:** ChatGPT images (manual, second bill), generic web photos (licenses, inconsistent look, UCSC-only dishes missing), Nano Banana 2 Lite (free only by hand in AI Studio; same API price as 2.1).
- **Budget:** his $10 top-up ("just do as much as oyu can with that"): today's and tomorrow's dishes first (cap $4.60), then the rest of the week up to about $9.30, about $0.70 kept for photo log tests.
- **Rationale:** one key and one bill, scriptable over 500+ dishes, counts toward the Gemini prize track; generated images are placeholders that a student's real photo-log photo replaces.
- **Status:** approved

# AI Agent Contract (decisions)
1. **Read before proposing or changing.** Consult `DECISIONS.md` before suggesting OR making any change to something it covers.
2. **A request that touches a locked decision is NOT itself authorization to reopen it** — even when phrased as a direct instruction (e.g. "switch the cards to borders," "make it green"). A stakeholder asking for the *change* is not the same as the human explicitly asking to *reopen the locked decision*. Before modifying any file, you MUST: **(a)** surface the locked entry, **(b)** quote its documented rationale, **(c)** ask the human to confirm they intend to supersede it. Implement only after that explicit confirmation — then append a new superseding entry. Do **not** implement in the same turn as the request. (This is the analog of the QA gate: locked decisions are a gate you don't silently pass.)
3. **Append when locked.** When a *new* non-trivial decision is settled, append an entry (Context / Options / Choice / Rationale / Consequences / Status) — same session, while the reasoning is fresh.
4. **Supersede, don't overwrite.** To change a past decision, add a new entry and mark the old one `superseded by <date>`. The log is append-only; never delete or rewrite a prior entry.
5. **Typed entries are mandatory where other files depend on them.** Removing a viewport from QA.md's matrix needs a **Viewport scope** entry; shipping an effect below its intended tier needs a **Performance trade** entry with measured numbers. Write it in the same turn as the change.
6. **Reversals made in code are logged in the same change.** A locked choice undone in code (a token, a layout, a component, copy), after the confirmation rule 2 requires, gets its superseding entry in the same commit as the code; a reversal that exists only in the code or in chat is invisible to the next session. QA Gate H (`check-drift.mjs`) flags code changed with no doc update.

# Versioning
`template_version: 1.23.1`. Per-project `DECISIONS.md` instances should preserve this field.

# Source
ADR (Architecture Decision Record) practice, adapted as an append-only log for agentic builds — so locked choices survive across sessions. Background (finding F11) is in `docs/SYSTEM_RESEARCH.md` (in the premium.md repo, the release zip and the skill bundle).

## 2026-11-14 — Photo log method
- **Context:** PLAN.md items "Photo log ... calories from UCSC labels" and "Use the standard dining hall plate as a size ruler".
- **Choice:** Gemini (gemini-3.8-flash, server only, `src/app/api/log/route.ts`) only recognizes: it picks dishes from that hall's menu for the meal (the response schema makes recipeId an enum of the menu's ids, so it cannot invent a dish), lists anything else as "not on the menu" (shown, never counted), and estimates servings against each dish's official portion using the hall plate (about 9 in, a 6 in well about 1 in deep), the bowl (about 5 in, 3 in deep) and the flat pizza plate as rulers, identified by shape, never color. Calories and macros are always the UCSC label numbers times servings, never Gemini's guess. The student fixes servings with the slider before saving.
- **Disclosure (Devpost):** the method was inspired by Arshawn's earlier personal project, Trackify (a menu-matched photo calorie tracker); SlugGrub's code, prompt and schema were written fresh at DevFest, with no code copied or ported.
- **Status:** draft (# draft until he signs off)

## 2026-11-14 — Calories stay on the device
- **Choice:** saved plates live in this browser's localStorage only (`src/components/screens/plates.ts`), never Firebase or the server, so no one else can ever see them (team rule: calories private). Trade-off: they do not follow the student to another phone. Today card 6 reads that store.
- **Status:** draft

## 2026-11-14 — Today reads through a one-minute cache
- **Choice:** Today's data (top dish, leaderboard, budget, the hall's menu, the campus clock for meal and hours) is read in one `"use cache"` function with `cacheLife("minutes")` in TodayScreen, so the page still opens static (no loading state) while meal and hours stay within about a minute of the campus clock (Pacific time). Revisit when rankings or budget become per-student (cookies or sign-in cannot be read inside a cache).
- **Status:** draft
