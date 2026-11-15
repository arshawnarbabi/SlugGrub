// Owner: Arshawn. Screenshots every screen for the review page (public/dev/review.html) with headless Chrome.
//   node scripts/review-shots.mjs [base-url]      (default http://localhost:3001, the production build)
// Each shot is a phone-width window tall enough to show the whole screen (the app scrolls inside its own scroller, so a tall
// window lays the full content out). Shots marked `seed` first save an example onboarding profile (public/dev/seed.html).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = (process.argv[2] ?? "http://localhost:3001").replace(/\/$/, "");
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "public/dev/review");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// id, title (what the screen is and its state), route, window size, seed a profile first
const SHOTS = [
  ["S01", "Today, first open (no profile yet)", "/", [393, 1900]],
  ["S02", "Today, with a saved profile", "/", [393, 1900], true],
  ["S03", "Halls, with a saved profile", "/halls", [393, 2600], true],
  ["S04", "Rank, this or that", "/rank", [393, 1100]],
  ["S05", "Rank, leaderboard", "/rank?view=Leaderboard", [393, 1700]],
  ["S06", "Budget, example numbers (no profile)", "/budget", [393, 1500]],
  ["S07", "Budget, with a saved profile", "/budget", [393, 1500], true],
  ["S08", "Log a plate", "/log", [393, 1100]],
  ["S09", "Ask SlugGrub", "/ask", [393, 1100]],
  ["S10", "Onboarding, step 1: meal plan", "/onboarding", [393, 900]],
  ["S11", "Onboarding, step 2: Slug Points", "/onboarding?step=1", [393, 900]],
  ["S12", "Onboarding, step 3: college", "/onboarding?step=2", [393, 1000]],
  ["S13", "Onboarding, step 4: usual hall", "/onboarding?step=3", [393, 1000]],
  ["S14", "Live vote, phone", "/vote", [393, 1100]],
  ["S15", "Live vote, projector", "/vote/screen", [1280, 800]],
  ["S16", "Dining services", "/dining-services", [393, 1900]],
];

fs.mkdirSync(OUT, { recursive: true });
const manifest = [];
for (const [id, title, route, [w, h], seed] of SHOTS) {
  const inner = seed ? `/dev/seed.html?to=${encodeURIComponent(route)}` : route;
  // a phone-size frame page (headless Chrome won't go narrower than ~500px); the shot is cropped back to the frame afterwards
  const url = `${BASE}/dev/frame.html?w=${w}&h=${h}&p=${encodeURIComponent(inner)}`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sg-shot-"));
  const file = path.join(OUT, `${id}.png`);
  try {
    execFileSync(CHROME, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
      `--user-data-dir=${profile}`, `--window-size=${Math.max(w, 520)},${h}`, "--virtual-time-budget=9000", "--force-prefers-reduced-motion",
      `--screenshot=${file}`, url,
    ], { stdio: "ignore", timeout: 60_000 });
    if (w < 520) { // crop the 2x shot to the frame's width
      const sharp = (await import("sharp")).default;
      const buf = await sharp(file).extract({ left: 0, top: 0, width: w * 2, height: h * 2 }).png().toBuffer();
      fs.writeFileSync(file, buf);
    }
    manifest.push({ id, title, route, file: `${id}.png`, w, h });
    console.log(`${id} ${title}`);
  } catch (e) {
    console.error(`${id} failed: ${e.message}`);
  } finally {
    fs.rmSync(profile, { recursive: true, force: true });
  }
}
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({ base: BASE, takenAt: new Date().toISOString(), shots: manifest }, null, 1));
