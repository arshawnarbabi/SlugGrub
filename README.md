# SlugGrub

UCSC dining, ranked by students. See what's good at each dining hall right now, rank dishes against each other, log your plate with a photo, and keep your Slug Points on pace. Built at DevFest 2026.

## Stack

- Next.js 16 (App Router, TypeScript, `src/`), mobile-first web app
- Tailwind CSS 4, Framer Motion
- Gemini API (`@google/genai`), called from server routes only
- Firebase (Firestore for votes and rankings, Google sign-in)
- Deploy on Vercel

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the keys
npm run dev                  # http://localhost:3000
```

Open it on your phone on the same wifi at `http://<your-laptop-ip>:3000` to test the mobile layout and camera.

## The plan

**Tabs:** Today · Rank · [camera] · Halls · Budget

**Today:** what's good to eat right now, where, and whether you can afford it. Changes with the meal (breakfast, lunch, dinner, late night).
1. Header: current meal and hours at your usual hall
2. Top pick right now: highest-ranked dish being served at your hall, with calories, plus the best dish on campus tonight
3. Leaderboard snippet: top 3 halls this week and where your college stands
4. Budget snippet: points left, days left, pace bar (unlimited plans see their 75 cafe points)
5. Rank card: "Which was better at lunch?" with two dishes you ate
6. Calories today (private)

**Features**
- Gemini photo log: snap your plate, Gemini matches it to that hall's menu for the meal, calories come from the UCSC nutrition labels
- Ask SlugGrub: "high protein under 700 calories near Porter", Gemini picks from tonight's menus
- This-or-that ranking (Elo), not star ratings
- Live QR vote during the demo, leaderboard updates on screen
- College rivalry board, weekly
- Budget as a pace tracker (hall vs cafe vs market, run-out week, points left at quarter end)
- Onboarding: meal plan, current points, college, usual hall
- Cafe board: cafe menus don't rotate, so rankings carry over
- Dining services view: which dishes students love or skip, by hall
- Calories stay private; only taste is social

## Data notes

- Menus and nutrition labels: https://nutrition.sa.ucsc.edu/ (FoodPro). Shows yesterday through about a week ahead. Five halls: 40 John R. Lewis & College Nine, 05 Cowell & Stevenson, 20 Crown & Merrill, 25 Porter & Kresge, 30 Rachel Carson & Oakes. Needs a cookie session (load the home page first).
- TLS quirk: the site's certificate is issued by "InCommon ECC OV SSL CA 3" but the server sends the RSA chain, so Node's `fetch` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Fix by adding the missing intermediate through `NODE_EXTRA_CA_CERTS`. Do not turn off certificate checks.
- Dining hall hours are not on the menu site; enter them by hand for now.

## Structure (planned)

```
src/app/            pages: / (Today), /rank, /halls, /budget, /log, /api/*
src/components/     UI pieces
src/lib/            menu data, Gemini, Firebase, Elo, budget math
scripts/            menu fetcher
data/               saved menus (generated)
```
