# SlugGrub plan

The one shared plan for the team and for every AI working in this repo. New to GitHub? Read [docs/TEAM-GUIDE.md](docs/TEAM-GUIDE.md) first. **If it is not in this file, it is not decided.** Change it in a commit like any code: tick your boxes, add decisions, move things around. Keep the Google Doc for brainstorming only; this file wins if they disagree.

Last updated: 2026-11-14

## What we're building

UCSC dining, ranked by students. See what's good at each dining hall right now, rank dishes against each other, log your plate with a photo, and keep your Slug Points on pace.

**Design rule:** calories stay private, taste is social. Nobody sees anyone else's calories, and nothing ranks people by eating less.

**Prize tracks:** Best Integration of Gemini or Google API, Best UI (main targets), Best Startup Potential, Best Social Impact.

**Demo story (about 2 min):** open Today, snap a real tray and see the dishes and real calories, rank it against yesterday's dish, judges scan a QR code and vote live, end on the college leaderboard moving on the projector.

## Team and who owns what

Each person owns their folders. **Don't edit files you don't own.** Ask in the group chat first, or have the owner make the change.

| Person | Owns | Folders and files |
|---|---|---|
| **Arshawn** | All design (look, layout, tab bar, shared UI), the Today page, the Gemini photo log | `src/app/layout.tsx`, `src/app/globals.css`, `src/components/ui/`, `src/app/page.tsx`, `src/app/log/`, `src/app/api/log/` |
| **Karen** | This-or-that ranking (Elo), Firebase and sign-in, live QR vote, leaderboard and college rivalry, dining services view | `src/app/rank/`, `src/app/vote/`, `src/app/dining-services/`, `src/lib/rankings.ts`, `src/lib/elo.ts`, `src/lib/firebase.ts` |
| **Ethan** | Menu fetcher and data, Halls tab, Budget, onboarding, Ask SlugGrub | `scripts/`, `data/`, `src/lib/menus.ts`, `src/lib/budget.ts`, `src/app/halls/`, `src/app/budget/`, `src/app/onboarding/`, `src/app/api/ask/` |
| **Starting branches** | `arshawn-design`, `karen-firebase`, `ethan-menus` (already on GitHub). After each is merged, make a new branch per feature: `<name>-<feature>`. | |
| **Shared (ask first)** | Data types, fake data, this plan | `src/lib/types.ts`, `data/mock/`, `PLAN.md`, `AGENTS.md`, `package.json` |

**How the pieces connect:** everyone codes against the types in `src/lib/types.ts`. Each owner's `src/lib/*.ts` file exports functions the others call (for example Today calls `getTopDishNow()` from Karen's `rankings.ts` and `getBudgetSnapshot()` from Ethan's `budget.ts`). Those functions return fake data from `data/mock/` until the real version is ready, so nobody waits on anyone. **Keep each function's name and return type stable**; change what's inside freely.

## Features and status

Tick a box when it's merged to `main`. Put your name on anything you pick up that isn't listed.

### Setup (Arshawn + Claude)
- [x] Next.js app, packages, README
- [x] Shared plan, AI rules, types, fake data, empty pages, tab bar
- [ ] Gemini API key in everyone's `.env.local` (who: ?)
- [ ] Firebase project created, config in everyone's `.env.local` (Karen)
- [ ] Repo connected to Vercel for preview links (who: ?)

### Arshawn
- [ ] Visual design: colors, type, spacing, components in `src/components/ui/`
- [ ] Tab bar: Today · Rank · [camera] · Halls · Budget
- [ ] Today page (cards below)
- [ ] Photo log: camera, send to `/api/log`, Gemini matches dishes to that hall's menu for the meal, show dishes, servings slider, calories from UCSC labels
- [ ] Use the standard dining hall plate as a size ruler in the Gemini prompt

### Karen
- [ ] Firebase setup and Google sign-in
- [ ] This-or-that ranking screen and Elo scoring
- [ ] Hall leaderboard and weekly college rivalry board
- [ ] Live QR vote page (`/vote`) for judges, updates in real time
- [ ] Dining services view: loved and skipped dishes by hall
- [ ] `getTopDishNow()` and `getLeaderboard()` return real data

### Ethan
- [ ] Menu fetcher (see "Menu data" below), saves to `data/menus/`
- [ ] `getMenu()` returns real data
- [ ] Halls tab: list of halls, each hall's menu for the current meal
- [ ] Cafe board: cafe menus don't rotate, so rankings carry over
- [ ] Onboarding: meal plan, current points, college, usual hall
- [ ] Budget tab: pace tracker (run-out week, points left at quarter end, hall vs cafe vs market)
- [ ] Ask SlugGrub: "high protein under 700 calories near Porter", Gemini picks from tonight's menus

### Today page cards (Arshawn builds, data from Karen and Ethan)
1. Header: current meal and hours at your usual hall
2. Top pick right now: highest-ranked dish at your hall, with calories, plus the best dish on campus tonight
3. Leaderboard snippet: top 3 halls this week and where your college stands
4. Budget snippet: points left, days left, pace bar (unlimited plans see their 75 cafe points)
5. Rank card: "Which was better at lunch?"
6. Calories today (private, one line)

Keep it to what fits on one phone screen. The cafe snippet lives in the Halls tab.

### Pitch and demo (everyone, last block)
- [ ] 3 or 4 tested demo plates (photos that Gemini gets right every time)
- [ ] Seed rankings so the leaderboard isn't empty
- [ ] Devpost write-up (list any code written before the event)
- [ ] Rehearse the 2 minute demo twice
- [ ] Code freeze 2 to 3 hours before judging

## Timeline

Judging time: **? (fill in)**

| When | Goal |
|---|---|
| Sat afternoon | Setup done, everyone building on fake data |
| Sat night | Each person's core feature works end to end |
| Sun morning | Real menu data in, Today page pulls everything together, deployed |
| Sun before freeze | Polish, demo plates, seed data, rehearse |

## Menu data

- Source: https://nutrition.sa.ucsc.edu/ (FoodPro). Shows yesterday through about a week ahead, so save daily.
- Halls: `40` John R. Lewis & College Nine, `05` Cowell & Stevenson, `20` Crown & Merrill, `25` Porter & Kresge, `30` Rachel Carson & Oakes. Meals: Breakfast, Lunch, Dinner, Late Night.
- Pages: `shortmenu.aspx` (meals that day), `longmenu.aspx` (dishes by category, with portion and `RecNumAndPort` link), `label.aspx` (nutrition label per recipe). Load the home page first to get the session cookie.
- TLS quirk: the certificate is issued by "InCommon ECC OV SSL CA 3" but the server sends the RSA chain, so Node's `fetch` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Fix by adding the missing intermediate through `NODE_EXTRA_CA_CERTS`. **Don't turn off certificate checks.**
- Dining hall hours are not on the menu site. Type them in by hand.
- Be polite: one request at a time with a short pause.

## Decisions

Newest first. Add a line when the team decides something.

- 2026-11-14: Web app (Next.js), not native, so judges can vote by QR with nothing to install.
- 2026-11-14: This-or-that ranking with Elo, not star ratings (HungrySlugs already does stars).
- 2026-11-14: Slug Points budget stays, as a pace tracker. "Cheapest hall" is out: a meal costs the same at every hall.
- 2026-11-14: Calories private, taste social.
- 2026-11-14: Ownership split: Arshawn design + Today + photo log, Karen ranking + Firebase + voting, Ethan menus + Halls + Budget + Ask.

## Open questions

- Which of the 13 suggestions did the team drop? ("almost everything" was approved)
- Judging time?
- Does DevFest allow code written before the event?
- Meal plan point amounts for 2026-27 (the numbers in `types.ts` are 2025-26, check dining.ucsc.edu)
- Does breakfast cost fewer points than dinner?
