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

## 2026-11-14 — One UI: every tab renders the shared screens
- **Choice:** the rankings, Elo and Firebase code (main, PR #1) and the menu fetcher, menu data, budget math and Ask route (ethan-menus) are merged into arshawn-design; their standalone page UIs (rank, vote, dining services, halls, budget, onboarding) are replaced by the screens in `src/components/screens`, and the data functions are wired into those screens. His words: "hook everything to my ui, dont use theirs". `src/lib/auth.ts` is the shared sign-in surface (`signInWithGoogle`, `ensureUser`); `src/components/screens/dishPhoto.ts` maps a dish name to its generated image.
- **Rationale:** one design system across every tab (docs/DESIGN.md); the data layer stays with its owners' functions and names.
- **Status:** approved

## 2026-11-14 — Sidestash segmented controls
- **Choice:** the Halls meal switch and the Rank view switch sit in one row with their Sidestash round button (search, live-vote QR). Track: the flat --paper-2 gray with the Sidestash chip shadow; selected thumb: the Sidestash finish (raise gradient, white hairline, chip shadow) over the goo thumb. His words: "dont do the indent. make the slider area like flat how its that darker gray but with the sidestash style shadwo, and then for the selected make it sidestash style". A pressed-in thumb was tried and dropped the same evening.
- **Also:** top bar status chips (Today's hall/meal/hours, Budget's plan) are Sidestash and not pressable ("dont make it clicable and make it sidestash stye").
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

## 2026-11-14 — Menu data: every offered day, unknown labels, nearest-day fallback
- **Context:** PLAN.md "Menu data" and the menus checklist; a review found 0-calorie fractional portions, 0 stored for missing labels, one saved day, a silent fall back to the 2-hall mock, and menu files missing from deployed builds.
- **Choice:** `npm run menus` saves every date the site offers (yesterday through about a week ahead), one request at a time, TLS fixed with NODE_EXTRA_CA_CERTS (checks stay on). The label key goes into the URL exactly as the site writes it (it is already URL-encoded). A missing label is stored as no nutrition (unknown), never 0. A meal whose long menu has only standing items (salad bar, condiments, drinks...) is treated as not served, which matches the site's short menu and the posted hours. `getMenu`/`getAllMenus` serve the nearest real day with `fallbackFor` set when a date has no file; the mock is used only when no real files exist, marked `mock: true`. Files are compact JSON and included in every server route's trace (`outputFileTracingIncludes`). Diet icons on the menu become `Dish.tags` (vegan, vegetarian, halal).
- **Consequences:** someone runs `npm run menus` daily (the site shows only about a week); new halls or meal names need the fetcher's lists updated.
- **Status:** draft

## 2026-11-14 — Hall hours, meal plans and the campus clock
- **Choice:** hours typed from dining.ucsc.edu/locations-hours (regular schedule, checked 2026-11-14) per day of week into `src/lib/halls.ts` (`hallHoursOn`, `mealNow`); Crown/Merrill and Porter/Kresge close on weekends; weekend brunch (9 to 2) shows the Breakfast menu until 11 and Lunch after, since the site lists brunch as both. `HALL_HOURS` stays a flat list (a Tuesday) for older callers. Meal plans updated to 2026-27 (Blue 1452, Gold 2037, Banana Slug 2772, Unlimited 100). Every date, meal and days-left number uses America/Los_Angeles.
- **Status:** draft

## 2026-11-14 — Profile on the device; budget pace from it
- **Choice:** onboarding answers live in localStorage (`sluggrub.profile`, `src/lib/profile.ts`) with `savedAt`; Google sign-in is optional and the app works signed out. Points entered on an earlier day are aged to today at the student's own average so far, and the Budget screen says so. The hall / cafe / market split is not shown: SlugGrub can't see card purchases, so any split would be invented.
- **Consequences:** Today's server-cached budget card can't read the phone's profile; `getBudgetSnapshot(profile?)` returns example numbers marked `source: "demo"` without one.
- **Status:** draft

## 2026-11-14 — Ask SlugGrub method and limits
- **Choice:** `/api/ask` sends Gemini (gemini-3.8-flash) only the meal each hall is serving now or next today (tomorrow's first meal after the last one closes), real dishes only (no condiments, drinks, sauces, buns or bars), with hall names and the colleges each serves. Picks are an enum of those dish ids (so Gemini can't invent one) and the calories and protein shown come from the UCSC labels. Questions are capped at 200 characters; 8 questions per 10 minutes per address and 120 an hour per server instance.
## 2026-11-14 — Rankings: real menus, two storage modes, one-vote rules
- **Context:** PLAN.md Karen checklist (Firebase and sign-in, this-or-that and Elo, leaderboard and college rivalry, live QR vote, dining services view, real getTopDishNow/getLeaderboard). Firebase config not ready; judging is tomorrow.
- **Options considered:** Firestore only (nothing works until config lands); a local-only demo store; both behind one client.
- **Choice:** both. With NEXT_PUBLIC_FIREBASE_* set: Firestore with anonymous sign-in (one vote per device), every write in one runTransaction, live state by onSnapshot, rules in firestore.rules that tie each counter change to a vote or skip document created in the same transaction. Without config: the same collections in an in-memory store behind src/app/api/vote, polled every 2 s. Server renders (Today) read Firestore over REST with a 3 s timeout, or the memory store.
- **Dishes:** the rankable categories (entrees, hot bars, market table, clean plate, grill, pizza, soups, breakfast, sweets) on today's real menus, keyed by hall + recipe id (the same recipe at two halls is two dishes); stored dishes overlay that list, so the first vote never replaces it. The old seed list is the fallback when no real menu is saved (its ratings kept, its made-up vote counts dropped).
- **Elo:** one K per match (the adaptive K of the less-voted dish) and a symmetric update, so ratings never drift; the 100 floor was removed because it broke symmetry.
- **One vote:** per user per matchup per day (vote id uid_date_pair); per device per live round. Live ballots also count as this-or-that votes (Elo and the voter's college), so the projector leaderboard moves while judges vote. Undo reverses the last this-or-that vote; ballots cannot be undone.
- **Standings:** hall score = 65% top-half average + 35% average of rated dishes (unchanged formula, now only dishes with votes or a seed rating). Weekly change compares with the week's opening board, the ranks the first reader of the week found (create-once document); halls without a rated dish are left out of it, so no arrow is shown until there is a real standing. College rivalry = votes cast this week by each college's students (atomic increments); the college comes from the onboarding profile in localStorage ("sluggrub_profile", then "sluggrub.profile").
- **QR:** a small encoder in src/lib/qr.ts (byte mode, level M, versions 1 to 6) instead of the qrcode package: node_modules is shared between worktrees and an install would have pruned packages present there but not in package.json. Verified by decoding generated codes with macOS CoreImage.
- **Consequences:** the local mode is one server's memory: not shared across Vercel instances and wiped on restart, so production and the judged demo on Vercel need Firebase. The Firestore path and the rules are unverified until a project exists (no emulator: it needs Java). Any signed-in device can start a live round; tighten to a host uid after the hackathon.
- **Status:** draft

## 2026-11-14 — Menus refresh themselves from the UCSC site
- **Context:** the site shows about a week ahead and the app only read committed JSON, so menus went stale (or fell back to a nearby day) unless someone ran `npm run menus` and pushed.
- **Audit first (2026-11-14, today and tomorrow, all 5 halls, every meal):** every saved meal matched the live short menu dish for dish; the only lines on the site and not in the files are "Deli Bar" and "Salad Bar", which have no label link and are hidden by Halls anyway. Halls 40 and 05 save about 280 lines a meal because their long menus also list the standing stations (fruit, cereal, condiments, salad bar and deli parts, bread, drinks); hall 30's long menu does not list them. That is the site, not a fetcher bug, and the standing lines stay saved because a photo log can match them. Three labels re-read live (BBQ Pork Ribs 420, Tempeh Roasted with Chorizo Spice 255, Cheese Pizza 185 cal) matched the saved numbers.
- **Choice:** one parser, `src/lib/foodpro.ts`, shared by the script and the server. A day is read the way the site shows it: the short menu says which meals a hall serves (none when closed), the long menu gives the lines, the label page the numbers; an unreachable page fails the whole day, so a failed request never saves or serves a day with meals missing (before, it silently dropped that meal). Saved files carry `fetchedAt`. `getMenu`/`getAllMenus` (names and types unchanged) use a saved file younger than 3 hours; otherwise, for yesterday through 10 days ahead, they read the site on the server (`src/lib/menuLive.ts`: node https agent trusting Node's root store plus the InCommon intermediate, certificate checks on; one request at a time with a 250 ms pause; 6 s per page, 40 s per day) through `"use cache"` + `cacheLife("hours")`. A caller waits at most 3.5 s; a slower read keeps going and serves the next caller; after a failure the date is not retried for 5 minutes. Otherwise the saved file, else the nearest saved day marked `fallbackFor`. Builds (`next build`) use the committed files only. Labels already in `data/nutrition-cache.json` (now traced into the build) are reused.
- **Proof:** with a day's file removed (test worktree), the first request fell back to the nearest day at 3.5 s and about 15 s later the same date came back from the site, identical to the `npm run menus` file (same hash); with the intermediate taken out of the agent, the read failed in about 1.3 s ("unable to verify the first certificate") and the saved menus were served.
- **Consequences:** committed files are now only the fallback; `npm run menus` still refreshes them. On Vercel each instance keeps its own in-memory cache, so a cold instance may serve the committed day for its first request. The rank catalog (`src/lib/rankCatalog.ts`) keeps each date's dish list for the life of the process, so a menu change later in the day reaches Halls, Today, Log and Ask but not the ranking pool until a restart.
- **Status:** draft

## 2026-11-14 — Side-scrolling pager for Rank matchups and Halls menus (trial)
- **Context:** his asks: "lets try an animation where when you slect a food item and hte next one comes in, it scrolls to the side instead of just blurring in a new one and you can manually scroll to go back to change your answer. all per the design.md", then for Halls chips "make it scroll smoothly left and right instead of just blurring to change the content ... consistent with the rank udpate".
- **Options considered:** keep the blur-fade swap (motion.state_change) for both; a framer-motion slide; native scroll snap.
- **Choice:** native scroll snap in one shared component (src/components/ui/Pager.tsx, .carousel.pager), so swiping by hand and the automatic move are the same scroll, and Rank and Halls behave identically. On Rank, changing an earlier answer undoes the old vote through rankBackend().undo before saving the new one (a matchup's id is the same whichever side wins). The blur-fade stays for state changes inside a page (the "or" badge, the meal switch).
- **Consequences:** the side scroll is a movement beyond motion.state_change, accepted at his request for these two pagers only; revert by swapping Pager back for Appear.
- **Status:** trial (# draft until he keeps it)

## 2026-11-14 — Halls: meal switch and search share one Sidestash row
- **Context:** his words: "maybe if this slider is relevant, combine it with the search button. if you do, make ti look nice and give it the sidestash style too".
- **Choice:** the search button leaves the top bar and sits at the right end of the meal switch row; both take the Sidestash finish (.raised: --raise, --hi hairline, --chip-shadow), which until now was only on the top bar buttons and the nav bar. Seg gained optional `className` and `render` props (src/components/ui/motion.tsx); "Late night" shows as "Late" under 360px so the row fits at 320.
- **Status:** draft

## 2026-11-14 — Cafes and markets: the site's short menus, live, with posted hours
- **Context:** his words: "make sure all hte menu items are correct and live and correctly listed for the diniing halls but all the cafes and anything else on here if there is". An audit of `data/cafes.json` against nutrition.sa.ucsc.edu found: item counts taken from the long menu, which also lists modifiers ("Add Caramel Sauce", milks) under "All Day" that the site's menu leaves out (Banana Joe's showed 25, the site lists 16 or 17); Global Village Cafe's "Drinks Specials" missing (they have no label link, so only the short menu shows them); prices not read; the two markets left out; UCen Coffee Bar placed at Quarry Plaza (dining.ucsc.edu: the University Center, above College Nine/JRL Dining Hall); Perk Coffee Bar placed only at Baskin (one menu serves three Perk bars); the board's "Same menu every day" (bakery items and prices change day to day); and a weekend board showing Friday's menus with no word that every cafe is closed.
- **Choice:** one reader in `src/lib/foodpro.ts` for the script and the server (`fetchCafes`): a location's items are its short menu lines with their prices (a "$0.00" placeholder is no price), matched to the long menu for recipe id, portion and diet icons; each location gets today's menu, or the next day the site lists one (up to a week); a day of only add-ons counts as no menu (Global Village Cafe's Monday 11/16 listing). `getCafes(date?)` (name and return type kept; optional fields `kind`, `price`, `tags` added) uses `data/cafes.json` when it was fetched under 3 hours ago for today's campus date, otherwise reads the site through the same live path as the halls (`src/lib/menuLive.ts`: certificate checks on with the bundled intermediate, one request at a time, 6 s a page, 60 s for the whole read, kept an hour, 5 minutes before retrying after a failure; callers wait at most 3.5 s), otherwise the saved file. Hours are typed from each location's page on dining.ucsc.edu/locations-hours (`src/lib/cafeHours.ts`, regular hours, checked 2026-11-14, no special hours posted); a location with no posted hours shows no open status.
- **Proof (production build, throwaway worktree, port 3401):** with the saved file marked stale, the first read served the saved file at 3.5 s and about 25 s later the site's own read came back identical (same hash) to the file `npm run cafes` had just written; with the intermediate left out of the agent, the read failed ("unable to verify the first certificate") in under 50 ms and the saved file was served. The build traces `data/cafes.json` into every route.
- **Consequences:** a cafe read is up to about 40 pages on a weekend (closed days are walked), queued behind any hall read on the same server. Owl's Nest's bowl parts (base, protein, toppings, sauces) count as items because the site lists them.
- **Status:** draft

## 2026-11-14 — Onboarding: cards instead of campus maps for college and hall
- **Context:** his review of S12 and S13: "i dont like this ggraphic" (the campus maps).
- **Choice:** both steps use the plan step's card fan. The hall step previews the real hall: today's dish photo and open status, so the student sees what Today will show them. The onboarding page reads the same per-hall dish picks as Log's demo plate (`demoPlates`, moved from `src/app/log/page.tsx` to `src/components/screens/demoPlates.ts` so both pages share one pick; Log's behavior is unchanged).
- **Consequences:** `/onboarding` now reads today's menus through the one-minute cache, like `/log`. A hall closed today (two close on weekends) shows the neutral dish tile.
- **Status:** draft

## 2026-11-14 — Onboarding: the college map returns; the hall card shows the hall's building
- **Context:** his review of the card version (S12): "i think i liked the map more, just make it look better and not sloppy like before"; (S13): "keep this like this but only if you can get images of each college from the web and put them here or even better their dining hall building".
- **Choice:** the college step goes back to a campus map, rebuilt (DESIGN.md note of the same date): real positions from latitude and longitude, an unstretched aspect ratio, and a name tag that picks a side clear of every pin and the edges. The hall step keeps its card but shows a photo of the hall instead of a dish. Photos come from Wikimedia Commons under CC BY-SA (public/halls/CREDITS.md). Commons has a usable building shot only for Crown/Merrill (Crown College plaza, the dining hall at the left); its one Porter/Kresge dining hall photo is a 649 x 184 interior strip, too small, so Porter/Kresge, JRL/C9, Cowell/Stevenson and Carson/Oakes show one of their colleges. No UCSC site photos were needed.
- **Consequences:** `/onboarding` no longer reads today's menus (the demo dish is gone), so the page is static again (src/app/onboarding/page.tsx back to its earlier form). Supersedes the college half of "Onboarding: cards instead of campus maps".
- **Status:** draft

## 2026-11-14 — Final check: fixes found by driving the production build
- **Context:** his ask: "do one more check to make sure everything works functionally and this time maybe drive the website to see for yourself in action". Every flow was driven at 393px in Chrome against the production build (port 3001) and recorded; these are the functional bugs it turned up. Each is its own commit.
- **Today's top dish card opens its hall.** When the usual hall is closed (Porter/Kresge and Crown/Merrill on weekends) the card shows "#1 at Carson/Oakes", but it linked to plain /halls, which opens the usual hall ("closed today"), so the dish was nowhere on the page. It now links to `/halls?hall=<id>`; Halls reads `hall` on the client (cacheComponents: no searchParams in render) and it wins over the usual hall.
- **Rank opens on the view its link asks for.** Next keeps a visited route's state (cacheComponents holds it in a hidden Activity), and Rank only ever switched *to* the leaderboard from `?view=Leaderboard`, never back, so after the college card had been used, "Rank today's food" (/rank) opened on the leaderboard. The view is now set from the URL on every arrival, both ways. The line over the matchup also names where its dishes come from: "Dinner at Porter/Kresge" only when they are that meal there, "Today at <hall>" for the hall's whole day, and "Today across campus" when the usual hall is closed and the pairs come from every hall (it said "Dinner at Porter/Kresge" over Cowell/Stevenson and JRL/C9 dishes).
- **Live vote: the voting phone no longer counts its own vote twice.** With Firebase the phone reads its ballot once per round, so after voting it kept adding its optimistic +1 on top of a tally that already held the vote: one phone showed "3 votes, 33% / 67%" while /vote/screen showed the true "2 votes, 50% / 50%". The phone now remembers the side's count when it voted and stops adding once the live count passes it (or at once when the store answers "already").
- **Status:** draft
