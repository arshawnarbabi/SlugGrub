# SlugGrub team guide

Never used GitHub, pull requests or a coding agent before? Start here. Read Part 1 once, then follow Part 3 every time you work.

**Who owns what and what's left to do:** [PLAN.md](../PLAN.md). **Rules your AI follows:** [AGENTS.md](../AGENTS.md).

---

## Part 1: The words you need

| Word | What it means |
|---|---|
| **Repo** (repository) | The project folder, stored on GitHub so all three of us share it. Ours: https://github.com/arshawnarbabi/SlugGrub |
| **Clone** | Download the repo to your laptop. You do this once. |
| **Commit** | A saved checkpoint of your changes, with a short note about what you did. It is saved on your laptop only. |
| **Push** | Upload your commits to GitHub so others can see them. |
| **Pull** | Download everyone else's new work from GitHub to your laptop. |
| **Branch** | Your own copy of the project to work on, so you don't step on anyone. `main` is the shared, working version. You never work on `main` directly. |
| **Pull request (PR)** | A request to add your branch's work into `main`. GitHub shows exactly what you changed, and anyone can look before it goes in. |
| **Merge** | Accepting a pull request: your work becomes part of `main`. |
| **Merge conflict** | Two people changed the same lines of the same file. Git can't guess which one to keep, so a person has to choose. Our file ownership rules exist to prevent this. |

The whole idea in one sentence: **you work on your own branch, then a pull request moves your work into `main`.**

---

## Part 2: One-time setup (about 15 minutes)

1. **Accept the invite.** Arshawn adds you on GitHub. Check your email or https://github.com/notifications and accept. Without this you can see the code but can't upload to it.
2. **Install Node.js.** Download the "LTS" version from https://nodejs.org and install it. This runs the app.
3. **Install git** (if you don't have it).
   - Mac: open Terminal, type `xcode-select --install`, press Enter, and follow the popup.
   - Windows: download from https://git-scm.com and install with the default options.
4. **Clone the repo in Antigravity.**
   - Open Antigravity. On the welcome screen choose **Clone Repository** (or press `Cmd+Shift+P` on Mac / `Ctrl+Shift+P` on Windows, type `Git: Clone`, press Enter).
   - Paste `https://github.com/arshawnarbabi/SlugGrub.git`, pick a folder, and open it when asked.
   - If it asks you to sign in to GitHub, say yes and sign in.
5. **Install the project's packages.** In Antigravity open a terminal (menu **Terminal > New Terminal**) and run:
   ```
   npm install
   ```
6. **Add the secret keys.** Run this (Mac) or the Windows line:
   ```
   cp .env.example .env.local
   ```
   ```
   copy .env.example .env.local
   ```
   Open `.env.local` and paste in the keys Arshawn sends you in a DM. **Never upload this file.** Git already ignores it.
7. **Run the app.**
   ```
   npm run dev
   ```
   Open http://localhost:3000. You should see the Today page and the tab bar. Press `Ctrl+C` in the terminal to stop it.

   To see it on your phone: same wifi, then open `http://<your-laptop-ip>:3000` on the phone.

---

## Part 3: Every time you work (the loop)

You can click buttons in Antigravity, type commands in the terminal, or ask the agent to do it. All three do the same thing. The commands are shown so you know what's happening.

### Step 1: Get the latest `main`
```
git checkout main
git pull
```
Do this before starting anything new, so you build on everyone's latest work.

### Step 2: Make a branch for one feature
```
git checkout -b karen-rank-screen
```
Name it `<yourname>-<feature>`. One branch per feature. In Antigravity you can also click the branch name in the bottom-left corner and choose **Create new branch**.

### Step 3: Build it with the agent
Start each agent chat by saying who you are, so it follows the rules for your files:

> I'm Karen. Read PLAN.md and AGENTS.md. Then build the this-or-that ranking screen in src/app/rank/. Use fake data for now.

> I'm Ethan. Read PLAN.md and AGENTS.md. Then write the menu fetcher in scripts/fetch-menus.ts using the notes in PLAN.md under "Menu data".

Tips:
- Ask for one thing at a time. Small asks work better than "build the whole app".
- Read what it changed before accepting. If it touched a file you don't own, tell it to undo that part.
- Run `npm run dev` and actually click through your screen before saving.

### Step 4: Commit (save a checkpoint)
In Antigravity: open the **Source Control** panel (the branching icon on the left), type a short message like `Rank screen with two dish cards`, and click **Commit**. If it asks to stage all changes, say yes.

Or in the terminal:
```
git add -A
git commit -m "Rank screen with two dish cards"
```
Commit often, every time something works.

### Step 5: Push (upload your branch)
Click **Publish Branch** (first time) or **Sync Changes** in the Source Control panel. Or:
```
git push -u origin karen-rank-screen
```

### Step 6: Open a pull request
1. Go to https://github.com/arshawnarbabi/SlugGrub. A yellow bar says your branch had recent pushes. Click **Compare & pull request**.
2. The description box already has a short checklist. Fill it in.
3. Click **Create pull request**.

### Step 7: Merge it
- If GitHub says **"This branch has no conflicts with the base branch"**, click **Merge pull request**, then **Confirm merge**.
- Post in the group chat: "merged the rank screen". Everyone else then runs Step 1 to get it.
- If it says there are conflicts, see Part 5.

### Step 8: Next feature
Go back to Step 1. **Make a new branch for each feature.** Don't keep using an old branch after it's merged.

Aim for a pull request every hour or two. Small pull requests almost never conflict. Big ones at the end of the day almost always do.

### Letting the agent do the git steps
You can ask the agent, for example:

> Commit my changes with a short message, push my branch, and give me the link to open a pull request.

That's fine. Read the commands it wants to run before you approve them. Say no if you see `main` being pushed to, `--force`, or `reset --hard`.

---

## Part 4: Our GitHub rules

1. **Never work on `main` directly.** Always a branch, always a pull request. `main` must always run, since it's what we demo.
2. **Only edit files you own.** The table in [PLAN.md](../PLAN.md) lists them. Need a change in someone else's file? Ask them in the group chat.
3. **Shared files need a heads-up first:** `src/lib/types.ts`, `data/mock/`, `package.json`, `AGENTS.md`. Say in the chat before changing them.
4. **Pull before you start** (Part 3, Step 1).
5. **Small pull requests, merged often.**
6. **Never upload keys.** `.env.local` stays on your laptop. Keys are shared in DMs only.
7. **Adding a package?** Say so in the chat first (for example "adding the qrcode package").
8. **Tick your box in PLAN.md** when your thing is merged. Add decisions there too, not just in the chat.
9. **Never force push** (`git push --force`). It can delete other people's work.
10. **Stuck for more than 10 minutes?** Ask in the chat. Don't fight git alone.

---

## Part 5: When something goes wrong

**"Updates were rejected" when pushing.** Someone pushed before you. Run:
```
git pull --rebase origin main
git push
```

**Merge conflict.** Ask the agent:
> I have a merge conflict. Show me the conflicting files and help me resolve it, keeping both people's changes where possible. Explain before you change anything.

If it's in a file you don't own, ask that file's owner to help.

**You made changes on `main` by accident** (and haven't committed yet). Move them to a new branch:
```
git checkout -b yourname-feature
```
Your changes come with you. Commit them there.

**The app won't start or shows "module not found".** Someone added a package. Run `npm install`, then `npm run dev` again.

**"Port 3000 is in use".** The app is already running in another terminal. Close that one, or open the port number it suggests.

**Something is badly broken and you don't know why.** Don't delete folders or reset anything. Ask in the chat.
