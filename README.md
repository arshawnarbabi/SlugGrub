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

Everything we're building, who owns what, and what's done: **[PLAN.md](PLAN.md)**. Rules for AI assistants (Claude Code and Antigravity): [AGENTS.md](AGENTS.md).

## How we work

New to GitHub or pull requests? **[docs/TEAM-GUIDE.md](docs/TEAM-GUIDE.md)** walks through setup, the branch and pull request loop, our rules, and fixes for common problems.

## Structure

```
src/app/            pages: / (Today), /rank, /log, /halls, /budget, /onboarding, /vote, /dining-services
src/app/api/        server routes (Gemini runs here only): /api/log, /api/ask
src/components/ui/  shared UI pieces (Arshawn)
src/lib/            types, halls, and each owner's data functions (menus, rankings, budget)
scripts/            menu fetcher (Ethan)
data/mock/          fake data to build against
data/menus/         saved real menus (generated)
docs/               team guide
```
