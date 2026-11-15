// Owner: Ethan. Server only. Reads one day's hall menus, and the cafe and market menus, straight from the UCSC site, with the same
// parser as `npm run menus` and `npm run cafes` (src/lib/foodpro.ts), so the app stays current without anyone committing new files. src/lib/menus.ts decides when to call it.
//
// TLS: the site sends the wrong intermediate (see INCOMMON_CA_PEM), so requests go through an https agent whose trusted CAs
// are Node's root store plus that one intermediate. Certificate checks stay on (never rejectUnauthorized: false).
// Polite: one request at a time with a short pause, across every caller in this server process.
import https from "node:https";
import tls from "node:tls";
import fs from "node:fs";
import path from "node:path";
import kinds from "../../data/dish-kinds.json";
import { BASE_URL, INCOMMON_CA_PEM, fetchCafes, fetchDay, type Cafe, type Label } from "./foodpro";
import { addDays } from "./campusTime";
import type { DayMenu } from "./types";

const agent = new https.Agent({ ca: [...tls.rootCertificates, INCOMMON_CA_PEM], keepAlive: true, maxSockets: 1 });
const PAUSE_MS = 250; // between requests
const REQUEST_MS = 6_000; // one page
const DAY_BUDGET_MS = 40_000; // a whole day (about 20 menu pages plus any labels not seen before); past it the day fails
const CAFES_BUDGET_MS = 60_000; // every cafe and market (about 20 pages on a weekday, about 40 on a weekend: closed days are walked)
const STANDING = new Set<string>(kinds.standingCategories);

function request(url: string, cookie: string, signal: AbortSignal): Promise<{ status: number; cookies: string[]; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent, signal, timeout: REQUEST_MS, headers: { Cookie: cookie, "User-Agent": "SlugGrub (campus menu reader)" } }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c: string) => { body += c; });
      res.on("end", () => resolve({ status: res.statusCode ?? 0, cookies: res.headers["set-cookie"] ?? [], body }));
      res.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error(`timed out after ${REQUEST_MS} ms`)));
    req.on("error", reject);
  });
}

// One queue for the whole process, so concurrent refreshes never hit the site in parallel.
let queue: Promise<unknown> = Promise.resolve();
let last = 0;
function polite<T>(work: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = PAUSE_MS - (Date.now() - last);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    try { return await work(); } finally { last = Date.now(); }
  });
  queue = run.catch(() => undefined);
  return run;
}

let cookie = "";
function getter(signal: AbortSignal) {
  return async (url: string): Promise<string | null> => {
    if (signal.aborted) throw new Error("day budget used up");
    if (!cookie) {
      const home = await polite(() => request(`${BASE_URL}/`, "", signal));
      cookie = home.cookies.map((c) => c.split(";")[0]).join("; ");
    }
    try {
      const res = await polite(() => request(url, cookie, signal));
      return res.status === 200 ? res.body : null;
    } catch (err) {
      if (signal.aborted) throw err;
      return null;
    }
  };
}

// Labels: seeded from the committed cache (data/nutrition-cache.json, traced into the build), plus any read live since.
let labels: Map<string, Label> | null = null;
function labelCache(): Map<string, Label> {
  if (labels) return labels;
  try {
    labels = new Map(Object.entries(JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "nutrition-cache.json"), "utf8"))));
  } catch {
    labels = new Map();
  }
  return labels;
}

export interface LiveDay { fetchedAt: string; menus: DayMenu[] }
export interface LiveCafes { fetchedAt: string; date: string; cafes: Cafe[] }

// A read in progress is shared by every caller, and kept for an hour once done, so a request that stopped waiting still leaves
// its result for the next one. After a failure the same read is not tried again for a few minutes.
const KEEP_MS = 60 * 60_000;
const RETRY_MS = 5 * 60_000;
function sharedReader<T extends { fetchedAt: string }>(budgetMs: number, work: (key: string, signal: AbortSignal) => Promise<T>) {
  const inflight = new Map<string, Promise<T>>();
  const recent = new Map<string, T>();
  const failed = new Map<string, number>(); // key -> when its last read failed
  return (key: string): Promise<T> => {
    const kept = recent.get(key);
    if (kept && Date.now() - Date.parse(kept.fetchedAt) < KEEP_MS) return Promise.resolve(kept);
    const fail = failed.get(key);
    if (fail && Date.now() - fail < RETRY_MS) return Promise.reject(new Error("the last read failed a few minutes ago"));
    let p = inflight.get(key);
    if (!p) {
      p = work(key, AbortSignal.timeout(budgetMs)).then((v) => {
        recent.set(key, v);
        if (recent.size > 12) recent.delete(recent.keys().next().value as string);
        return v;
      }).catch((err) => { cookie = ""; failed.set(key, Date.now()); throw err; }).finally(() => inflight.delete(key)); // a fresh session next time
      inflight.set(key, p);
    }
    return p;
  };
}

/** One day's menus from the site. Rejects when the site is unreachable, too slow, or serves no meals at any hall. */
export const fetchLiveDay = sharedReader<LiveDay>(DAY_BUDGET_MS, async (date, signal) => {
  const menus = await fetchDay({ get: getter(signal), standing: STANDING, labels: labelCache() }, date);
  if (!menus.some((m) => Object.keys(m.meals).length)) throw new Error(`the site lists no meals on ${date}`);
  return { fetchedAt: new Date().toISOString(), menus };
});

/** Every cafe and market from the site, each with the menu it lists on `date` or the next day it lists one (up to a week).
 *  Rejects when a page is unreachable, the read is too slow, or no location lists a menu that week. */
export const fetchLiveCafes = sharedReader<LiveCafes>(CAFES_BUDGET_MS, async (date, signal) => {
  const cafes = await fetchCafes(getter(signal), Array.from({ length: 8 }, (_, i) => addDays(date, i)));
  if (!cafes.some((c) => c.itemCount)) throw new Error(`the site lists no cafe or market menus from ${date}`);
  return { fetchedAt: new Date().toISOString(), date, cafes };
});
