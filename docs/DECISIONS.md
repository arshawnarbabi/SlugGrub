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
- **Budget's "Update points" opens the points question** (`/onboarding?step=1`) instead of the meal plan question. Onboarding reads `step` on every arrival, so a visit without it starts at the first question even though Next keeps the route's state.
- **Status:** draft

- 2026-11-14: Dining services list "Most skipped" renamed "Least picked" (empty state "No dish is losing yet."). The list ranks skips and lost matchups together, so "skipped" misread when only losses existed. His yes to the rename.

## 2026-11-14 — Demo mode: believable mock rankings in the browser, nothing written to Firebase
- **Context:** the rankings store holds only a handful of test votes, so the leaderboard, Dining services and the live vote look empty. His ask: "well i would want mock info to polish more", for polishing the UI and for judging on his phone. He chose an in-app demo mode over writing fake votes to Firebase.
- **Choice:** open any page with `?demo=1` to turn demo mode on and `?demo=0` to turn it off; the choice is remembered on that device (localStorage `sluggrub.demo`, every access in try/catch; read on the client after mount, never during a server render). `public/dev/seed.html?...&demo=1` turns it on for the review screenshots (shot S17, the populated leaderboard). While it is on, `useRankState` and every vote go to an in-memory store in the browser (src/lib/rankDemo.ts) instead of Firestore or /api/vote, with the same state shape, so the vote flow, undo, changing an answer by swiping back, skips, the live round and the projector all work; a reload starts the mock week over. Today and Halls redo their server-side picks over the same mock state (src/components/screens/demoViews.ts), so every screen agrees. A "Demo data" chip shows on Rank, Dining services, /vote and /vote/screen (DESIGN.md note of the same date).
- **The mock week:** a fixed-seed generator over this week's real catalog (/api/demo: today's menus plus the rest of the week, real hall ids, recipe ids, names and photos). Up to 28 dishes per hall (140 with today's menus), 1,000 simulated matchups (about 7% skips) played through the app's own Elo (calculateElo), so elo, votes and wins agree. A hidden appeal per dish: mains and desserts tend to win, plain sides, condiments and plain rice lose, with noise; every hall has a clear #1. All ten colleges get a weekly count with a spread, the opening board swaps two neighbouring pairs of halls so movement arrows show, and the live round pairs two real dishes with a close, modest tally (its ballots count as matchups too).
- **Consequences:** nothing in demo mode reads or writes Firestore (no subscription is opened, and the week's opening board is never written). Real votes are untouched and show again with `?demo=0`.
- **Status:** draft

- 2026-11-15: Log demo plate carries its menu date. At 12:01 AM a page opened before midnight sent Saturday's Red Curry Tofu with Sunday's date and failed ("nothing on JRL/C9's dinner menu"); the demo plate now sends the day it was picked from (his report, screenshot).
- 2026-11-15: Ask send button is an up arrow (Hugeicons ArrowUp02), his ask. The button keeps focus in the field on pointer down so an iOS tap is not lost to the keyboard dropping, and the field blurs once the question is sent (his report that sending did not work on his phone; the API answered fine, so the tap was the suspect; unconfirmed on a real iPhone).

## 2026-11-15 — Goo surfaces hold every piece inside their own box (WebKit)
- **Context:** his iPhone recording of the food button in Safari: laggy, droplets with no blue blob, no visible split or merge, the button's corner cut square. WebKit clips liquid-gooey's promoted, CSS-filtered SVG layer to the Liquid element's box (overflow: visible is ignored), and the food button's box was only the 62px button; the 84px filterPadding plus a spread shadow made WebKit re-filter about 1M device pixels on the CPU every frame. His call: keep the goo if it can be made to work, remove it only if not.
- **Choice:** the goo stays. Every Liquid element is sized to hold its pieces wherever they travel (the food button's is a 143 x 163 box hanging off the button, pointer-events none, buttons auto); filterPadding is 0 everywhere; a goo surface's outer shadow is one plain drop shadow (no spread), so WebKit composites it, plus inset sheens inside the filter. No change to node_modules. DESIGN.md note of the same date has the measurements.
- **Consequences:** the food button's lift shadow is now one 0 4px 10px shadow instead of a 1px contact shadow plus an 8px lift with -8px spread (a small look change, his to judge on the phone). Supersedes the 2026-11-14 "filterPadding must cover how far pieces travel" rule.
- **Status:** draft


- 2026-11-15: Today greeting ends with a period ("Good morning." / "Good morning, Arshawn."), his ask; the brand page sample matches.

- 2026-11-15: Sliders follow the finger 1:1 while dragged (no spring under the finger; THE spring only for keyboard steps), and the whole 44px row takes the touch. His report on the onboarding Slug Points slider: "weird resistance ... just remove gooey there or fix it"; fixed with the goo kept (DESIGN.md note of the same date).


- 2026-11-15: Rank text buttons renamed to say what they do, his yes: "Too tough" is now "Can't decide" (moves on, records nothing) and "Skip" is now "Haven't tried these" (records a skip, which feeds Least picked on Dining services; its note reads "Noted. We'll ask about those another time"). The brand page sample in src/app/brand/Interactive.tsx still shows the old labels until that file is free.

- 2026-11-15: Budget "Update points" (and "Set up your plan" with no profile) is a full-width Sidestash secondary button (btn btn-secondary btn-block raised) at the bottom of the page instead of a small inline link under the ring, his ask ("so small. make it follow the style of the other buttons ... put it at the bottom"). The note under the ring keeps only its sentence and hides when it has nothing to say.

## 2026-11-15 — Log: a processing beam and a status card that morphs into the stats
- **Context:** his ask: "when you first scan a food or do the demo im thinkign we add this border beam around the border of the phone and we have the image and then under it we have \"Processing the food...\" or something like that and then when its fully processed it morphs into the the stats for it", with libraries.dev/beam (the `border-beam` package) as the reference.
- **Choice:** our own beam instead of `border-beam` (1.4.1, MIT). That package wraps one element and drives it with a 30 fps requestAnimationFrame loop plus animated conic gradients (@property) and blur filters, so around the whole screen it would repaint a screen-sized layer every frame on iPhone. Ours draws the rainbow once into a 256px canvas, rotates it with a CSS transform (compositor only) and cuts it to a ring with a static mask; no package added. Under the photo one status card steps through what is happening and morphs into the calorie card (or the error card) on THE spring when the answer comes. DESIGN.md effects.registry processing-beam and the note of the same date hold the details, including the color exception (the one place the app uses more than its blues).
- **Consequences:** the beam sits over the nav bar's edge while it runs (z 9) and is removed when processing ends. Smooth in Chromium and Playwright WebKit on the dev server; not yet checked on a real iPhone.
- **Status:** draft


- 2026-11-15: Grill patties are named and pictured as burgers, his ask ("for the patty dishes its usualy hte entire burger with condoments studnets can choose, not just hte patty"). One rule in src/lib/dishNames.ts (a name ending "Patty" becomes "Burger", except sausage and hash brown patties) applied to every menu the app reads (src/lib/menus.ts), and the same rule in scripts/food-images.mjs, which now draws them as whole burgers (bun, cheese unless vegan, lettuce, tomato, onion, pickles, ketchup and mustard cups). New photos: Halal Blended Beef, Halal Chicken, Portobello Mushroom and Sustainable Salmon burgers (about $0.13). Calories stay the patty's UCSC label; the bun and toppings are their own menu items. The black bean patty is not on the current 9-day menus, so it has no photo yet.

## 2026-11-15 — Demo mode gets a button: Settings, Start demo, Leave demo
- **Context:** his ask: "idk if the webapp is already primed for demoing but if not then i want a button in like settings or something that is demo mode where it completely starts from onboarding and primes the webapp in demo mode". Demo mode was only `?demo=1` / `?demo=0`, and a phone that had been used showed its old plan and plates.
- **Choice:** a Settings page (/settings), opened from the profile button on Today. "Start demo" asks once in the page (a second tap, not a browser dialog), then clears this phone's profile (`sluggrub.profile`) and every saved plate (`sluggrub.plates.v1`), turns demo mode on (`setDemo` in src/lib/demoMode.ts, which also drops a `?demo=` left in the address bar and tells every screen) and opens onboarding at the first question with the default answers. Finishing onboarding in demo mode primes the app: if nothing is logged today, src/components/screens/demoSeed.ts writes one or two plates for today from real dishes on today's menus (/api/demo, the same catalog the mock rankings use): a main of at least 150 label calories plus a second dish from the same hall and meal, with UCSC label calories, at the usual hall when it serves that meal and at another hall when it does not; one plate per meal already over (the last two), or a breakfast plate "just now" early in the day. Their ids start `demo-`, so "Leave demo" (demo mode off) removes them and keeps anything the student logged. "Edit my plan, college and hall" opens onboarding with the saved answers filled in. Driven in the dev server 2026-11-15: Start demo cleared a 1-plate profile, onboarding opened on Gold with no profile, finishing wrote a 324 cal Cowell/Stevenson breakfast plate (Porter/Kresge is closed today), Today showed it with the Demo data chip, Leave demo left no plates and demo off.
- **Consequences:** onboarding resets to its defaults whenever nothing is saved (Next keeps the route's state from an earlier visit, so Start demo used to reopen it on the old answers). The "Demo data" chip is louder (blue tint with a dot) and also shows on Today. Budget needs no seeding: it fills from the onboarding answers.
- **Status:** draft

- 2026-11-15: Onboarding art moves between options on THE spring (his ask, DESIGN.md note of the same date): plan cards shuffle, the points ring springs, the college pin and tag travel across the map, the hall card deals in as the old one tilts away. Text inside still blur-fades.

- 2026-11-15: The "Demo data" chip wears the Sidestash blue of Today's status chip (blue raise gradient, white hairline, chip shadow) instead of the flat blue tint, his ask after running the demo ("the other version i said i didnt like, i wnat hte versiom we just haad with the blue backgroudn"). The flat tint is the version he turned down for the top chips on 2026-11-14.

- 2026-11-15: Food button droplets raised so Ask no longer overlaps the nav bar (his screenshot): Ask opens to (-60, -66), 11px above the bar's top edge; Log to (0, -90), keeping about 16px between the two; the goo box grew to 99px above the button to cover them.

- 2026-11-15: The "Demo data" chip is gone from every screen (Today, Rank, Dining services, /vote, /vote/screen), his ask after running the demo ("remove hte chip that keeps saying demo data at the top and just remove mention of demo data in that version on the app"). Demo mode now looks like the real app; it is still switched on and off only in Settings. The rankings error reads "Rankings could not load". The unused .demo-chip rule stays in globals.css (supersedes the 2026-11-15 chip notes in DESIGN.md).

## 2026-11-15 — Ask SlugGrub streams its answer, with a thinking orb and an action line, ported from Chalk
- **Context:** his ask: "for the sluggrud ai.i want smooth text streaming and action line like \"Thinking...\" or \"Reading menu...\" or somethingk liek that but actualy what the model is doing and i want thinking orb. look at Chalk app i have on my computer and just clone that action line and thinking orbs and smooth text streaming but follow this apps design.md for this".
- **Choice:** /api/ask streams NDJSON when the request sends `Accept: application/x-ndjson` (events in src/app/api/ask/contract.ts: step, delta, picks, then done or error); without the header it returns one JSON answer as before. Every step is real and sent when it starts: reading the menus, the halls and meal being checked (named), the Gemini call, Gemini's own thought headings (thinkingConfig includeThoughts), the answer text as it streams, the label match. The answer streams while the picks stay structured: one Gemini call with the same JSON schema (dish ids still an enum of this meal's dishes, so a pick can never be off the menu), "answer" ordered first, and its string decoded as it arrives; the picks are parsed and validated against the menu at the end exactly as before, numbers from the UCSC labels. Thinking moved from LOW to MEDIUM because LOW sent no thought summaries in testing. The Ask screen (src/components/screens/AskScreen.tsx, AskActionLine.tsx, ask.css) shows the orb and action line, paces the text, and fades the picks in (DESIGN.md note of the same date). Prior code: the action line (held, cross-faded words, the light sweep, "Worked for", the line closing), the pacing numbers and technique, and the dotted orb idea come from his own Chalk app; disclose on Devpost. The orb is our own transform-only build (Chalk uses the thinking-orbs package, a canvas loop; adding a package needs the team's say).
- **Consequences:** MEDIUM thinking makes answers slower: first words after about 5.5 s in testing (2 s at LOW), and one JSON-path question took 15 s; the 30 s timeout and the error messages are unchanged. Vercel runs route handlers on Node by default; no segment config was added (cacheComponents rejects "runtime" and "dynamic"). The stream sends Cache-Control no-transform so nothing gzips (and buffers) it. Checked on the dev server in Playwright WebKit and Chromium; not yet on a real iPhone or on Vercel.
- **Status:** draft


- 2026-11-15: The processing beam rides the edge of the plate photo, not the whole screen, and is blue (hue 215 to 265 around the primary) instead of rainbow, his ask ("put the border beam just around the image when processing the food including the demo, also make it blue themed colors"). The rainbow color exception in DESIGN.md is withdrawn.

## 2026-11-15 — Optional calorie goal, a calorie ring on Today, and Slug Points charged per dining hall visit
- **Context:** his words: "Shouldn't the calories today show like a ring of calories eaten vs calories left and shouldn't onboarding get your weight and height and age or whatever to calibrate the calorie tracker? I feel like this calorie thing is king of a gimmick. And how would it know how many slug points to take off becaus it's per entering the dining hall now per plate so would it group plates logged often as one dining hall trip and a pause for a few hours and more plates as another or how would that go? And I want a visual to show that the slug points were taken off or something like that". He then chose the "optional step" design for the goal.
- **Choice, goal:** one skippable onboarding step after the hall step: height (ft/in), weight (lb), age, sex (for the formula, with "Rather not say" using the midpoint of the two constants) and activity (Light 1.375, Moderate 1.55, Very active 1.725). Goal = Mifflin-St Jeor BMR (10 x kg + 6.25 x cm - 5 x age + 5 male / -161 female) times the factor, rounded to 10 (src/lib/calorieGoal.ts); 5'10", 160 lb, 19, male, moderate = 2,710. They can edit the number or type their own. Saved as the optional `goal` field of the profile in localStorage (`sluggrub.profile`), on this phone only: never sent to the server or Firebase, never shown to anyone. Old profiles have no goal and still load. Today's "Set a goal" and Settings' "Calorie goal" row open the step alone (?step=4&goal=1), which saves only the goal and keeps the date the points were entered; "Edit my plan, college and hall" ends on it. Re-saving onboarding with the same plan and points also keeps that date, so Budget's visit charges survive an edit. Start demo prefills 5'10", 160 lb, 19, male, moderate, so a demo ends with the ring.
- **Choice, Today:** with a goal, a ring of eaten vs goal, "N left" or "Goal reached", never red and no "over" wording, protein eaten beside it; without one, calories and protein eaten with no target and a "Set a goal" link. Plates now save their label protein (`proteinG`, optional on PlateLog); demo mode's example plates carry it too (/api/demo adds each of today's dishes' UCSC label protein).
- **Choice, Slug Points:** UCSC charges at the door, not per plate. Door prices in Slug Points, 2026-27, from https://dining.ucsc.edu/plans-pricing/entry/, checked 2026-11-15 and matching: breakfast 13.65, lunch 14.60, dinner 15.60, late night 14.60; unlimited plans pay nothing at the door. One home: src/lib/diningEntry.ts. Visit rule: plates at the same hall within 2 hours of the visit's first plate are one visit, charged once at the price of that first plate's meal; another hall, or more than 2 hours later, starts a new visit. Visits are stored next to the plates (`sluggrub.visits.v1`, src/components/screens/plates.ts); when plates are removed (Leave demo, Start demo) a visit left with no plates is dropped with its charge. Budget: points left = the points entered minus the charges of visits started since they were entered; only with no visit since does it fall back to the time-based estimate. computePace takes the charges as an optional argument, so the pace, the outlook line and the chart all follow the same points left. Log's saved state shows the charge in a small chip, and Today's Slug Points number morphs down the next time it shows (DESIGN.md note of the same date).
- **Consequences:** a visit is charged at the meal the plate was logged under (Log's meal switch), so logging breakfast at 11 AM charges breakfast. A plate logged without a plan set up still records its visit, so its charge counts once a plan exists if its time is after the points were entered. The 5-day unlimited plan's weekend door charges are not modeled (the app has one "Unlimited" plan). Unit-style checks of the visit rule and the formula passed; driven on the dev server with one demo plate (breakfast at JRL/C9: chip "−13.65 Slug Points · Breakfast at JRL/C9", Today 1,200 to 1,186, Budget 1,186 with the "minus 13.65" note).
- **Status:** draft

## 2026-11-15 — Calorie goal asks lose / maintain / gain, over two onboarding screens
- **Context:** his words: "for the calorie goal you also have to ask if they want to gain weight or lose wieight or maintain. and lets try to make this into 2 onboaring screens so it fis better".
- **Choice:** the goal step is now two: "About you" (height, weight, age, sex) and "Your goal" (activity, Lose weight / Maintain / Gain weight, the number, still editable or typed). Maintenance = Mifflin-St Jeor BMR x activity factor (unchanged); lose = maintenance - 500 (about a pound a week), gain = maintenance + 300 (a lean gain), maintain = maintenance. The formula's goal never goes below the person's BMR, nor below 1,200 (female or rather not say) or 1,500 (male), whichever is higher, clamped silently; then rounded to 10 (a clamped goal rounds up, so rounding never goes back under the floor). 5'10", 160 lb, 19, male, moderate: maintain 2,710, lose 2,210, gain 3,010 (checked in the code and on screen). One home: src/lib/calorieGoal.ts (DIRECTION, bmrFromBody, goalFromBody). The direction is stored as the optional `direction` on the profile's goal; goals saved before it have none and read as maintain, so old profiles keep their number. Today's "Set a goal" and Settings' "Calorie goal" open "About you" (?step=4&goal=1); "Edit my plan, college and hall" ends on "Your goal". Start demo prefills both screens (5'10", 160 lb, 19, male, moderate, maintain). Skip on either screen means no goal.
- **Consequences:** a number the student types is kept as typed (800 to 8,000, as before); the floor applies only to the formula's goal. Copy stays about fueling, never dieting.
- **Status:** draft

- 2026-11-15: The calories card on Today is a full, prominent card right under the #1 dish (was a small row lower down), his ask ("make the calries a bigger more prominent card on today tab"): a 132px ring with the calories left at 26px, calories eaten at 24px, protein beside it; with no goal, a 28px calories-eaten number and the Set a goal link.

- 2026-11-15: Finishing onboarding never logs a plate, demo or not (the example plates from demo mode are gone; demoSeed.ts removed), and Start demo also forgets the numbers Today last showed, so Today opens with an empty calorie ring showing the goal (0 eaten, the full goal left). His ask: "have it not log a plate as soon as onboarding is finished ... the ring and total should be empty and reflect the calorie goal. not fill to show the goal". The Log demo plate is how the ring fills in a demo.
