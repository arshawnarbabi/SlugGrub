// Owner: Ethan. Shared reader for UCSC's FoodPro menu site (https://nutrition.sa.ucsc.edu), used by fetch-menus.ts and
// fetch-cafes.ts. See PLAN.md, "Menu data".
//
// TLS: the site's certificate comes from "InCommon ECC OV SSL CA 3" but the server sends the RSA chain, so Node's fetch fails
// with UNABLE_TO_VERIFY_LEAF_SIGNATURE. We add the missing intermediate (INCOMMON_CA_PEM in src/lib/foodpro.ts) through
// NODE_EXTRA_CA_CERTS (Node reads it only at startup, so the script re-runs itself once with it set). Certificate checks stay on.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { BASE_URL, INCOMMON_CA_PEM } from "../src/lib/foodpro.ts";

// The page parsers live in src/lib/foodpro.ts, shared with the server's live menu refresh (src/lib/menuLive.ts).
export * from "../src/lib/foodpro.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CA_PATH = path.join(HERE, "incommon-ca.pem");

/** Call first thing in a script: re-runs the script once with the extra CA set, then exits with its status. */
export function ensureCa(scriptPath: string) {
  if (process.env.NODE_EXTRA_CA_CERTS) return;
  if (!fs.existsSync(CA_PATH)) fs.writeFileSync(CA_PATH, INCOMMON_CA_PEM, "utf8");
  const res = spawnSync(process.execPath, [scriptPath, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, NODE_EXTRA_CA_CERTS: CA_PATH },
  });
  process.exit(res.status ?? 1);
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let cookieHeader = "";
let last = 0;
/** One request at a time with a short pause (be polite to the site). The home page is loaded first for the session cookie. */
export async function get(url: string): Promise<string | null> {
  if (!cookieHeader) {
    const res = await fetch(`${BASE_URL}/`);
    cookieHeader = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
    await res.text();
  }
  const wait = 250 - (Date.now() - last);
  if (wait > 0) await sleep(wait);
  last = Date.now();
  try {
    const res = await fetch(url, { headers: { Cookie: cookieHeader } });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.warn(`  request failed: ${url.slice(0, 120)}: ${(err as Error).message}`);
    return null;
  }
}

/** Today's date on campus (Pacific time), YYYY-MM-DD. */
export function campusToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(now);
}
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

