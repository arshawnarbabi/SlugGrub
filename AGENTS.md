<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Team rules for AI assistants (Claude Code, Antigravity, any agent)

Three people (Arshawn, Karen, Ethan) and their AI assistants work in this repo at the same time during a 2-day hackathon. These rules keep everyone from overwriting each other. This file is the one home for them: Antigravity reads AGENTS.md directly, and Claude Code reads it through CLAUDE.md.

## Before you do anything

1. Read `PLAN.md`. It is the shared plan and the source of truth for what we're building, who owns what, and what's done.
2. Ask the person you're working with who they are if you don't know. Their name decides which files you may edit.

## Ownership

- **Only edit files your person owns** (table in `PLAN.md`, "Team and who owns what"). If a change is needed in someone else's file, stop and tell your person what to ask the owner for. Don't make the change.
- **Shared files** (`src/lib/types.ts`, `data/mock/`, `package.json`, `AGENTS.md`): don't change them without your person confirming the team agreed. Adding a new optional field to a type is fine; renaming or removing one is not.
- **Keep exported function names and return types stable** in `src/lib/*.ts`. Others call them. Change the inside freely.
- **`PLAN.md`** is everyone's: tick boxes for work that's merged, add decisions, add open questions. Don't delete other people's items.

## Git

- Work on a branch named after the feature (`today`, `photo-log`, `rank`, `menus`), never directly on `main`.
- `git pull --rebase origin main` before starting and before pushing.
- Small pull requests, merged often (every hour or two).
- Never commit `.env.local` or any key.
- Tell your person before adding a package; they should tell the group chat.

## Code

- Next.js 16 App Router, TypeScript, Tailwind 4. Check `node_modules/next/dist/docs/` when unsure (see AGENTS.md).
- Mobile first: design for a phone screen, about 390px wide.
- Use components from `src/components/ui/` for anything visual. Arshawn owns the design; don't invent new colors or styles in feature folders.
- Gemini is called only from server code (`src/app/api/`). The key is never sent to the browser.
- Use the types in `src/lib/types.ts`. Use fake data from `data/mock/` until the real data function is ready.
- Calories are private: never show one user's calories to another user.
- Beginner how-to for the team (git, branches, pull requests): `docs/TEAM-GUIDE.md`. If your person seems new to git, walk them through it step by step and explain each command before running it.
- Never push to `main`, never force push (`--force`), and never run `git reset --hard` without your person saying yes.
