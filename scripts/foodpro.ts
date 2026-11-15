// Owner: Ethan. Shared reader for UCSC's FoodPro menu site (https://nutrition.sa.ucsc.edu), used by fetch-menus.ts and
// fetch-cafes.ts. See PLAN.md, "Menu data".
//
// TLS: the site's certificate comes from "InCommon ECC OV SSL CA 3" but the server sends the RSA chain, so Node's fetch fails
// with UNABLE_TO_VERIFY_LEAF_SIGNATURE. We add the missing intermediate through NODE_EXTRA_CA_CERTS (Node reads it only at
// startup, so the script re-runs itself once with it set). Certificate checks stay on.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CA_PATH = path.join(HERE, "incommon-ca.pem");

const INCOMMON_CA_PEM = `-----BEGIN CERTIFICATE-----
MIIDNjCCArygAwIBAgIQOHk0l89NJv2948rV3tVF/zAKBggqhkjOPQQDAzBfMQsw
CQYDVQQGEwJHQjEYMBYGA1UEChMPU2VjdGlnbyBMaW1pdGVkMTYwNAYDVQQDEy1T
ZWN0aWdvIFB1YmxpYyBTZXJ2ZXIgQXV0aGVudGljYXRpb24gUm9vdCBFNDYwHhcN
MjUxMTA2MDAwMDAwWhcNMzUxMTA1MjM1OTU5WjBIMQswCQYDVQQGEwJVUzEWMBQG
A1UEChMNSW5Db21tb24sIExMQzEhMB8GA1UEAxMYSW5Db21tb24gRUNDIE9WIFNT
TCBDQSAzMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEI+ejNeQ1LxNI1+tUq8zJ
qYGVjJtq0ehfh/urxTAnMdocLMkAYGW4bc3hUgnDq2P2bpAnt8kvEHsSms9+eZ9C
NKOCAW8wggFrMB8GA1UdIwQYMBaAFNEi2kxZ8UtfJjiqndbu6w3D+6lhMB0GA1Ud
DgQWBBTOcO80VCw+mDhxIld7K0RZkFG+GTAOBgNVHQ8BAf8EBAMCAYYwEgYDVR0T
AQH/BAgwBgEB/wIBADATBgNVHSUEDDAKBggrBgEFBQcDATATBgNVHSAEDDAKMAgG
BmeBDAECAjBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8vY3JsLnNlY3RpZ28uY29t
L1NlY3RpZ29QdWJsaWNTZXJ2ZXJBdXRoZW50aWNhdGlvblJvb3RFNDYuY3JsMIGE
BggrBgEFBQcBAQR4MHYwTwYIKwYBBQUHMAKGQ2h0dHA6Ly9jcnQuc2VjdGlnby5j
b20vU2VjdGlnb1B1YmxpY1NlcnZlckF1dGhlbnRpY2F0aW9uUm9vdEU0Ni5wN2Mw
IwYIKwYBBQUHMAGGF2h0dHA6Ly9vY3NwLnNlY3RpZ28uY29tMAoGCCqGSM49BAMD
A2gAMGUCMQCgENV+enAFTkpPIXg6u7yCsAq+bkjiJvBsVonfnqY0hVAftb8D39Bt
5Wf8NlBZRF4CMF/znj8ZRYNUgxY2o0/nzEiJ3hJBuYuUmfpbYc5BcBsy+vItNAQ7
mHOhDI5rvYg6LA==
-----END CERTIFICATE-----
`;

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

export const BASE_URL = "https://nutrition.sa.ucsc.edu";
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

export function decodeText(raw: string): string {
  return raw
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** MM/DD/YYYY as the site's dtdate wants it, URL-encoded once. */
export const dtdate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return encodeURIComponent(`${m}/${d}/${y}`);
};

/** Today's date on campus (Pacific time), YYYY-MM-DD. */
export function campusToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(now);
}
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const shortMenuUrl = (num: string, name: string, iso?: string) =>
  `${BASE_URL}/shortmenu.aspx?sName=UC+Santa+Cruz+Dining&locationNum=${num}&locationName=${encodeURIComponent(name)}&naFlag=1` +
  (iso ? `&WeeksMenus=UCSC+-+This+Week%27s+Menus&dtdate=${dtdate(iso)}` : "");

export const longMenuUrl = (num: string, name: string, iso: string, meal: string) =>
  `${BASE_URL}/longmenu.aspx?sName=UC+Santa+Cruz+Dining&locationNum=${num}&locationName=${encodeURIComponent(name)}&naFlag=1&dtdate=${dtdate(iso)}&mealName=${encodeURIComponent(meal)}`;

/** The dates in a short menu page's date picker, YYYY-MM-DD. */
export function datesOffered(shortMenuHtml: string): string[] {
  const out = new Set<string>();
  for (const m of shortMenuHtml.matchAll(/<option[^>]*dtdate=(\d{1,2})%2f(\d{1,2})%2f(\d{4})/gi)) {
    out.add(`${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`);
  }
  return [...out].sort();
}

/** The meal names a short menu page lists ("Breakfast", "Lunch", ... or "Menu" at cafes). */
export function mealsOffered(shortMenuHtml: string): string[] {
  return [...shortMenuHtml.matchAll(/class=['"]shortmenumeals['"]>([^<]+)/g)].map((m) => decodeText(m[1]));
}

export interface LongItem {
  category: string;
  recipeId: string;
  /** "recipeId*portion" exactly as the site writes it in the label link (already URL-encoded, e.g. "400082*1%2f12"). */
  labelKey: string;
  name: string;
  portion?: string;
  tags: string[];
}

// Legend icons on the long menu -> our tags. Allergen icons are skipped here (the label's allergen line is the source).
const TAGS: Record<string, string> = { vegan: "vegan", veggie: "vegetarian", halal: "halal" };

/** Every item on a long menu page, in page order, with its category, portion and diet tags. */
export function parseLongMenu(html: string): LongItem[] {
  const items: LongItem[] = [];
  let category = "General";
  const re =
    /<div class=['"]longmenucolmenucat['"]>--\s*(.+?)\s*--<\/div>|<a href=['"]label\.aspx\?[^'"]*RecNumAndPort=(([^*&'"]+)\*[^&'"]+)[^'"]*['"][^>]*>([\s\S]*?)<\/a>|LegendImages\/([a-z0-9_]+)\.gif|class=['"]longmenucolportions['"]>([^<]*)<\/div>/g;
  let cur: LongItem | null = null; // the item whose row we are in (its legend icons and portion cell follow its link)
  for (const m of html.matchAll(re)) {
    if (m[1]) {
      category = decodeText(m[1]);
      cur = null; // a category row has its own (empty) portion cell
    } else if (m[2]) {
      cur = { category, labelKey: m[2], recipeId: m[3], name: decodeText(m[4].replace(/<[^>]+>/g, "")), tags: [] };
      items.push(cur);
    } else if (m[5] && cur) {
      const t = TAGS[m[5]];
      if (t && !cur.tags.includes(t)) cur.tags.push(t);
    } else if (m[6] !== undefined && cur) {
      cur.portion = decodeText(m[6]) || undefined;
      cur = null; // the row's portion cell closes the row
    }
  }
  return items;
}
