// Owner: Arshawn. Makes one Gemini food image per unique dish name on the UCSC dining hall menus (docs/food-image-prompt.md).
//
//   node --env-file=.env.local scripts/food-images.mjs --dry-run      # fetch menus, count dishes and cost, write nothing paid
//   node --env-file=.env.local scripts/food-images.mjs                # generate every missing image
//   options: --from -1 --days 9 (menu days, from = offset from today)   --limit N   --only "Dish Name"   --max-cost 20   --concurrency 3
//   DevFest days only: --from 0 --days 2
//
// Steps: (1) read each hall's short menu from nutrition.sa.ucsc.edu for today through --days ahead (curl, one request at a
// time with a pause; Node's fetch fails on the site's certificate chain, see PLAN.md "Menu data"); (2) one cheap text call per
// 40 names writes each dish's visual description and vessel, and marks plain components (buns, sauces, broth, toppings) to skip;
// (3) Nano Banana 2.1 draws each dish, every image after the first gets the first as its style reference; (4) sharp saves
// full (720), md (360) and sm (160) JPEGs to public/food/gen/ and updates public/food/gen/index.json (dish name -> image).
// Resumable: dishes that already have an image are skipped. Stops at once when the key is out of credits.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "public/food/gen");
const CACHE = path.join(ROOT, "scripts/.food-images-cache.json"); // menus and descriptions, so reruns don't repeat paid text calls
const PROMPT_DOC = path.join(ROOT, "docs/food-image-prompt.md");
const IMAGE_MODEL = "gemini-nano-banana-2.1";
const TEXT_MODEL = "gemini-3.8-flash";
const PER_IMAGE = 0.0336; // USD per 1K image, Google's pricing page 2026-11-14

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i < 0 ? d : args[i + 1]; };
const DRY = args.includes("--dry-run");
const LIMIT = Number(opt("--limit", Infinity));
const ONLY = opt("--only", null);
const MAX_COST = Number(opt("--max-cost", 20));
const DAYS = Number(opt("--days", 9));
const FROM = Number(opt("--from", -1)); // first day, relative to today (-1 = yesterday)
const CONC = Number(opt("--concurrency", 3));

const HALLS = [
  ["40", "John R. Lewis & College Nine Dining Hall"],
  ["05", "Cowell & Stevenson Dining Hall"],
  ["20", "Crown & Merrill Dining Hall"],
  ["25", "Porter & Kresge Dining Hall"],
  ["30", "Rachel Carson & Oakes Dining Hall"],
];
const VESSEL = {
  plate: ["a plain matte white round ceramic plate", "plate"],
  bowl: ["a plain matte white round ceramic bowl", "bowl"],
  "small plate": ["a small plain matte white round ceramic plate", "small plate"],
  glass: ["a clear plain drinking glass", "glass"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : { menus: {}, desc: {} };
const saveCache = () => fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));

// The prompt lives in the doc, so the doc and the script never drift: first code block = prompt, second = reference preamble.
const blocks = [...fs.readFileSync(PROMPT_DOC, "utf8").matchAll(/```\n([\s\S]*?)```/g)].map((m) => m[1].trim());
const [PROMPT, REF_PREAMBLE] = blocks;

function decode(s) {
  return s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&#039;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

async function menus() {
  const jar = path.join(ROOT, "scripts/.ucsc-cookies.txt");
  const curl = (url) => execFileSync("curl", ["-s", "-b", jar, "-c", jar, url], { encoding: "utf8", maxBuffer: 20e6 });
  curl("https://nutrition.sa.ucsc.edu/");
  const names = new Map(); // name -> [{hall, meal, date}]
  const today = new Date();
  for (const [num, hall] of HALLS) {
    for (let d = FROM; d < FROM + DAYS; d++) {
      const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d);
      const key = `${num}|${day.toDateString()}`;
      let list = cache.menus[key];
      if (!list) {
        const date = `${day.getMonth() + 1}%2f${day.getDate()}%2f${day.getFullYear()}`;
        const html = curl(`https://nutrition.sa.ucsc.edu/shortmenu.aspx?sName=UC+Santa+Cruz+Dining&locationNum=${num}&locationName=${encodeURIComponent(hall)}&naFlag=1&WeeksMenus=UCSC+-+This+Week%27s+Menus&dtdate=${date}`);
        list = [];
        for (const part of html.split(/class=.shortmenumeals.>/).slice(1)) {
          const meal = part.split("<")[0];
          for (const m of part.matchAll(/class=.shortmenurecipes.><span[^>]*>([^<]+)/g)) list.push([decode(m[1]), meal]);
        }
        cache.menus[key] = list;
        saveCache();
        await sleep(400);
      }
      for (const [name, meal] of list) {
        if (!names.has(name)) names.set(name, []);
        names.get(name).push({ hall: num, meal, date: day.toISOString().slice(0, 10) });
      }
    }
  }
  return names;
}

function outOfCredits(e) {
  const s = String(e?.message ?? e);
  return /prepayment credits are depleted|RESOURCE_EXHAUSTED.*(credit|billing)|402/i.test(s);
}

async function describe(ai, names) {
  const todo = names.filter((n) => !cache.desc[n]);
  for (let i = 0; i < todo.length; i += 40) {
    const batch = todo.slice(i, i + 40);
    const res = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text:
        `These are dish names from UC Santa Cruz dining hall menus. For each, write one plain sentence describing what the served dish looks like (main pieces, sauce, colors, how it is cut, what it is served with if the name says so), pick the serving vessel, and mark "skip" true for things that are not a dish someone would rate on their own: plain bread or buns, sauces, dressings, condiments, broths, toppings, plain noodles or rice meant as a base, and build-your-own bar names. Keep each name exactly as given.\n\n${batch.map((n) => `- ${n}`).join("\n")}` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: "array", items: { type: "object", required: ["name", "description", "vessel", "skip"], properties: {
          name: { type: "string" }, description: { type: "string" },
          vessel: { type: "string", enum: Object.keys(VESSEL) }, skip: { type: "boolean" } } } },
      },
    });
    for (const r of JSON.parse(res.text)) if (batch.includes(r.name)) cache.desc[r.name] = r;
    saveCache();
    process.stdout.write(`described ${Math.min(i + 40, todo.length)}/${todo.length}\r`);
  }
  if (todo.length) console.log();
}

function fill(name, d) {
  const [vessel, short] = VESSEL[d.vessel] ?? VESSEL.plate;
  const into = short === "bowl" || short === "glass" ? "into" : "onto";
  return PROMPT.replaceAll("onto {vessel}", `${into} {vessel}`).replaceAll("{dish_name}", name).replaceAll("{dish_description}", d.description.replace(/\.$/, ""))
    .replaceAll("{vessel_short}", short).replaceAll("{vessel}", vessel);
}

async function draw(ai, name, d, ref) {
  const parts = [];
  if (ref) parts.push({ inlineData: { mimeType: "image/jpeg", data: ref.toString("base64") } }, { text: REF_PREAMBLE });
  parts.push({ text: fill(name, d) });
  const res = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [{ role: "user", parts }],
    config: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "4:3", imageSize: "1K" } },
  });
  const img = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!img) throw new Error(`no image returned (${res.candidates?.[0]?.finishReason ?? "unknown"})`);
  const buf = Buffer.from(img.inlineData.data, "base64");
  const s = slug(name);
  for (const [dir, w] of [["", 720], ["md", 360], ["sm", 160]]) {
    fs.mkdirSync(path.join(OUT, dir), { recursive: true });
    await sharp(buf).resize({ width: w }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, dir, `${s}.jpg`));
  }
  return s;
}

const names = await menus();
const all = [...names.keys()].sort();
console.log(`${HALLS.length} dining halls x ${DAYS} days: ${all.length} unique dish names`);
if (!process.env.GEMINI_API_KEY) { console.error("GEMINI_API_KEY missing: run with node --env-file=.env.local"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const index = fs.existsSync(path.join(OUT, "index.json")) ? JSON.parse(fs.readFileSync(path.join(OUT, "index.json"), "utf8")) : {};
const missing = all.filter((n) => !index[n] && (!ONLY || n === ONLY));
if (DRY) {
  console.log(`${missing.length} without an image; before skipping sauces, buns and bars: at most $${(missing.length * PER_IMAGE).toFixed(2)} at $${PER_IMAGE}/image`);
  process.exit(0);
}

try { await describe(ai, missing); }
catch (e) { if (outOfCredits(e)) { console.error("Stopped: the Gemini key is out of credits. Top up at https://ai.studio/projects, then rerun."); process.exit(2); } throw e; }

const queue = missing.filter((n) => cache.desc[n] && !cache.desc[n].skip).slice(0, LIMIT);
const skipped = missing.filter((n) => cache.desc[n]?.skip).length;
console.log(`${queue.length} to draw (${skipped} skipped as components or bars), about $${(queue.length * PER_IMAGE).toFixed(2)}; cap $${MAX_COST}`);

let ref = fs.existsSync(path.join(OUT, "_style.jpg")) ? fs.readFileSync(path.join(OUT, "_style.jpg")) : null;
let spent = 0, done = 0, failed = [];
const saveIndex = () => fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(Object.fromEntries(Object.entries(index).sort()), null, 1));

async function one(name) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (spent + PER_IMAGE > MAX_COST) throw Object.assign(new Error("cost cap"), { cap: true });
    try {
      spent += PER_IMAGE;
      const s = await draw(ai, name, cache.desc[name], ref);
      if (!ref) { ref = fs.readFileSync(path.join(OUT, `${s}.jpg`)); fs.copyFileSync(path.join(OUT, `${s}.jpg`), path.join(OUT, "_style.jpg")); }
      index[name] = `/food/gen/${s}.jpg`; saveIndex();
      console.log(`${++done}/${queue.length} ${name}`);
      return;
    } catch (e) {
      if (outOfCredits(e)) throw Object.assign(e, { credits: true });
      if (attempt === 3) { failed.push(`${name}: ${String(e.message).slice(0, 120)}`); return; }
      await sleep(4000 * attempt);
    }
  }
}

try {
  if (!ref && queue.length) await one(queue.shift()); // the first image becomes the style reference for the rest
  const work = [...queue];
  await Promise.all(Array.from({ length: CONC }, async () => { while (work.length) await one(work.shift()); }));
} catch (e) {
  if (e.credits) console.error("Stopped: the Gemini key is out of credits. Top up at https://ai.studio/projects, then rerun (finished images are kept).");
  else if (e.cap) console.error(`Stopped at the $${MAX_COST} cap. Rerun with a higher --max-cost to continue.`);
  else throw e;
}
console.log(`done ${done}, about $${spent.toFixed(2)} spent${failed.length ? `, ${failed.length} failed:\n  ${failed.join("\n  ")}` : ""}`);
