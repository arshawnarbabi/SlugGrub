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

Everything we're building, who owns what, and what's done: **[PLAN.md](PLAN.md)**. Rules for AI assistants: [CLAUDE.md](CLAUDE.md).

## How we work

1. Make a branch for your feature: `git checkout -b photo-log`
2. Commit and push to that branch, then open a pull request on GitHub
3. Pull often: `git pull --rebase origin main`
4. Merge small pull requests every hour or two
5. Only edit files you own (table in PLAN.md)

