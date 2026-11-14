# SlugGrub team guide

Never used GitHub, pull requests or a coding agent before? Start here.

**The short version:** do the few manual steps in Part 1, then paste your setup prompt from Part 2 into Antigravity. The agent does the rest of the setup, explains your job, and tells you when it's ready. After that, use the prompts in Part 3 every time you work.

**Who owns what and what's left to do:** [PLAN.md](../PLAN.md). **Rules your AI follows:** [AGENTS.md](../AGENTS.md).

---

## Part 1: Manual steps (the agent can't do these for you)

### 1. Accept the GitHub invite
Arshawn adds you to the repo. Accept it from your email or https://github.com/notifications. No GitHub account yet? Make one at https://github.com/signup first and send Arshawn your username.

### 2. Antigravity settings
Open Antigravity, then open **Settings**:
- **AI Credit Overages: Never.** Your plan has a free limit that refreshes. Credits (your $25) are only spent after that limit runs out, and only if this is on. Leave it on Never; turn it to Always only if you're blocked close to the deadline.
- That's the only setting to change. Everything else stays on the default.

### 3. Pick the model
In the agent chat, use the model dropdown at the bottom:

| When | Model |
|---|---|
| **Almost always** | **Gemini 4 Hydrogen**, thinking on High (the default) |
| Hydrogen's limit ran out | **Gemini 3.8 Flash** |
| All Gemini limits ran out | **Claude Sonnet 4.6** (separate limit, so it keeps you going) |
| Avoid | Claude Opus, Gemini 4 Argon, Gemini 4 Carbon, anything called "Orchestrator". They use up limits and credits several times faster. |

If Hydrogen isn't in your list, use Gemini 3.8 Flash. (Checked 2026-11-14 against Antigravity's models page; the lineup changes often. You can see what you've used under Settings, usage by model.)

### 4. Clone the repo
On Antigravity's welcome screen choose **Clone Repository** (or press `Cmd+Shift+P` on Mac / `Ctrl+Shift+P` on Windows and type `Git: Clone`). Paste:
```
https://github.com/arshawnarbabi/SlugGrub.git
```
Pick a folder, then **Open** it when asked. Sign in to GitHub if it asks.

If Clone Repository fails because git isn't installed: on Mac open Terminal and run `xcode-select --install`; on Windows install from https://git-scm.com. Then try again.

### 5. Have your keys ready
Arshawn will DM you the keys (Gemini, Firebase). Keep that DM open. The agent will tell you where to paste them. **Never paste keys into the agent chat, the group chat, or anywhere on GitHub.**

---

## Part 2: Paste your setup prompt

Open the agent chat inside the SlugGrub folder, make sure the model is set (Part 1, step 3), and paste **your** prompt below. Read what it says and approve its commands as it goes. It ends by saying it's ready.

### Karen's setup prompt
```
I'm Karen, on a 3-person hackathon team building SlugGrub. I'm new to GitHub, pull requests and coding agents, so explain each step in plain words before you do it, and tell me exactly when I need to do something myself.

Set me up from start to finish:

1. Read AGENTS.md, PLAN.md and docs/TEAM-GUIDE.md in this repo. Follow AGENTS.md for everything.
2. Check that git and Node.js are installed (git --version, node -v). If Node is missing or older than 20, stop and tell me to install the LTS version from https://nodejs.org, then wait for me.
3. Run npm install.
4. If .env.local doesn't exist, copy .env.example to .env.local. Then tell me to open .env.local and paste in the keys Arshawn DMed me. Don't ask me to paste keys into this chat. Wait until I say done.
5. Start the app with npm run dev and tell me which address to open in my browser. Wait for me to confirm I see the Today page, then stop the app.
6. Make sure I'm on the latest main (git checkout main, git pull), then create my first branch: karen-firebase.
7. Explain my role in a few short lines: what I own (PLAN.md, "Karen"), the exact folders and files I'm allowed to edit, and the shared files I must ask the team about first.
8. My first job is Firebase. Walk me through what I have to do by hand in the Firebase console (create the project, add a web app, turn on Firestore and Google sign-in, copy the config into .env.local), one step at a time, waiting for me after each. Then set up src/lib/firebase.ts.
9. List my remaining tasks from PLAN.md in the order you suggest building them.
10. Explain how I save and share my work: commit, push, open a pull request, merge. Keep it short; it's in docs/TEAM-GUIDE.md, Part 3.

When everything above is done, end with exactly: "I understand the plan and my role, and I'm ready." If anything failed, tell me what failed instead of saying that.
```

### Ethan's setup prompt
```
I'm Ethan, on a 3-person hackathon team building SlugGrub. I'm new to GitHub, pull requests and coding agents, so explain each step in plain words before you do it, and tell me exactly when I need to do something myself.

Set me up from start to finish:

1. Read AGENTS.md, PLAN.md and docs/TEAM-GUIDE.md in this repo. Follow AGENTS.md for everything.
2. Check that git and Node.js are installed (git --version, node -v). If Node is missing or older than 20, stop and tell me to install the LTS version from https://nodejs.org, then wait for me.
3. Run npm install.
4. If .env.local doesn't exist, copy .env.example to .env.local. Then tell me to open .env.local and paste in the keys Arshawn DMed me. Don't ask me to paste keys into this chat. Wait until I say done.
5. Start the app with npm run dev and tell me which address to open in my browser. Wait for me to confirm I see the Today page, then stop the app.
6. Make sure I'm on the latest main (git checkout main, git pull), then create my first branch: ethan-menus.
7. Explain my role in a few short lines: what I own (PLAN.md, "Ethan"), the exact folders and files I'm allowed to edit, and the shared files I must ask the team about first.
8. My first job is the menu fetcher. Read PLAN.md, "Menu data", and explain the plan before writing code: which UCSC pages it reads, what it saves to data/menus/, and how it fixes the certificate problem by adding the missing intermediate certificate (never by turning off certificate checks). Then build scripts/fetch-menus.ts so getMenu() in src/lib/menus.ts can return real menus in the same shape as the fake data.
9. List my remaining tasks from PLAN.md in the order you suggest building them.
10. Explain how I save and share my work: commit, push, open a pull request, merge. Keep it short; it's in docs/TEAM-GUIDE.md, Part 3.

When everything above is done, end with exactly: "I understand the plan and my role, and I'm ready." If anything failed, tell me what failed instead of saying that.
```

---

## Part 3: Every time you work

### Start of a work session (paste this)
```
I'm <your name>. Read AGENTS.md and PLAN.md again, since they may have changed. Get me onto the latest main (git checkout main, git pull), run npm install in case someone added a package, and make a new branch called <yourname>-<feature> for: <what I'm building next>. Tell me what files you plan to change before you change them.
```

### While building
- Ask for one thing at a time, and name the file: "Add a vote button to src/app/rank/page.tsx" works better and costs less than "build the rank page".
- Start a **new chat** for each new task. Long chats use up your limit faster.
- Read what it changed. If it touched a file you don't own, tell it to undo that part.
- Run the app (`npm run dev`) and click through your screen yourself.

### When something works: ship it (paste this)
```
Commit my changes with a short clear message, push my branch, and open a pull request on GitHub (or give me the link to open one). Fill in the pull request checklist. Before you run any git command, show it to me. Never push to main and never force push.
```
Then on GitHub: if the pull request says **"no conflicts"**, click **Merge pull request** and **Confirm merge**. Post "merged <thing>" in the group chat so the others pull it. Then go back to the start-of-session prompt for your next feature.

Aim for a pull request every hour or two. Small ones almost never conflict.

### Before approving any command the agent wants to run
Say **no** if you see any of these, and ask in the group chat:
- `git push` to `main`
- `--force` or `-f` on a push
- `git reset --hard`, `git clean`, or deleting folders
- anything that prints or uploads `.env.local`

---

## Part 4: Our GitHub rules

1. **Never work on `main` directly.** Always a branch, always a pull request. `main` must always run, since it's what we demo.
2. **Only edit files you own.** The table in [PLAN.md](../PLAN.md) lists them. Need a change in someone else's file? Ask them in the group chat.
3. **Shared files need a heads-up first:** `src/lib/types.ts`, `data/mock/`, `package.json`, `AGENTS.md`.
4. **Pull before you start** (the start-of-session prompt does this).
5. **Small pull requests, merged often.**
6. **Never upload keys.** `.env.local` stays on your laptop. Keys are shared in DMs only.
7. **Adding a package?** Say so in the chat first.
8. **Tick your box in PLAN.md** when your thing is merged. Add decisions there too.
9. **Never force push.** It can delete other people's work.
10. **Stuck for more than 10 minutes?** Ask in the chat.

---

## Part 5: The words, if you're curious

| Word | What it means |
|---|---|
| **Repo** | The project folder, stored on GitHub so all three of us share it |
| **Clone** | Download the repo to your laptop (once) |
| **Commit** | A saved checkpoint of your changes, on your laptop only |
| **Push** | Upload your commits to GitHub |
| **Pull** | Download everyone else's new work |
| **Branch** | Your own copy to work on. `main` is the shared, working version |
| **Pull request (PR)** | A request to add your branch's work into `main`. GitHub shows exactly what changed |
| **Merge** | Accepting a pull request, so your work becomes part of `main` |
| **Merge conflict** | Two people changed the same lines. A person has to pick. Our file ownership rules prevent most of these |

---

## Part 6: When something goes wrong

Paste the error into the agent chat with:
```
I got this error. Explain what it means in plain words and how to fix it. Show me any command before running it.
```

Common ones:
- **"Updates were rejected" when pushing:** someone pushed first. The fix is `git pull --rebase origin main`, then push again.
- **Merge conflict:** ask the agent to show the conflicting files and help keep both people's changes. If it's in a file you don't own, ask that file's owner.
- **You worked on `main` by accident** (not committed yet): `git checkout -b <yourname>-<feature>` moves your changes to a new branch.
- **"Module not found":** someone added a package. Run `npm install`.
- **"Port 3000 is in use":** the app is already running somewhere. Close that terminal.
- **Something is badly broken:** don't delete or reset anything. Ask in the chat.
