// Owner: Ethan. The one reader for UCSC's FoodPro menu site (https://nutrition.sa.ucsc.edu), shared by the menu fetcher
// (scripts/fetch-menus.ts, run with plain `node`) and the server's live refresh (src/lib/menuLive.ts), so both parse the site
// the same way. Pure: no Node imports and no network of its own; callers pass in a `get` that fetches a page. Type imports
// only (erased when node strips the types), so the script can import this file directly. See PLAN.md, "Menu data".
import type { DayMenu, Dish, HallId, MealName, Nutrition } from "./types";

export const BASE_URL = "https://nutrition.sa.ucsc.edu";

// TLS: the site's certificate is issued by "InCommon ECC OV SSL CA 3" but the server sends the RSA chain, so a default Node
// client fails with UNABLE_TO_VERIFY_LEAF_SIGNATURE. This is the missing intermediate (chains to Sectigo Public Server
// Authentication Root E46, in Node's root store). Callers add it to the trusted CAs; certificate checks always stay on.
export const INCOMMON_CA_PEM = `-----BEGIN CERTIFICATE-----
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

/** The five dining halls as the site names them (locationNum, locationName). */
export const SITE_HALLS: { id: HallId; name: string }[] = [
  { id: "40", name: "John R. Lewis & College Nine Dining Hall" },
  { id: "05", name: "Cowell & Stevenson Dining Hall" },
  { id: "20", name: "Crown & Merrill Dining Hall" },
  { id: "25", name: "Porter & Kresge Dining Hall" },
  { id: "30", name: "Rachel Carson & Oakes Dining Hall" },
];
export const SITE_MEALS: MealName[] = ["Breakfast", "Lunch", "Dinner", "Late Night"];

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

export const shortMenuUrl = (num: string, name: string, iso?: string) =>
  `${BASE_URL}/shortmenu.aspx?sName=UC+Santa+Cruz+Dining&locationNum=${num}&locationName=${encodeURIComponent(name)}&naFlag=1` +
  (iso ? `&WeeksMenus=UCSC+-+This+Week%27s+Menus&dtdate=${dtdate(iso)}` : "");

export const longMenuUrl = (num: string, name: string, iso: string, meal: string) =>
  `${BASE_URL}/longmenu.aspx?sName=UC+Santa+Cruz+Dining&locationNum=${num}&locationName=${encodeURIComponent(name)}&naFlag=1&dtdate=${dtdate(iso)}&mealName=${encodeURIComponent(meal)}`;

/** labelKey is the site's own "recipe*portion" string, already URL-encoded ("400082*1%2f12"): it goes into the URL as is.
 *  (Encoding it again turned "1%2f12" into "1%252f12", which the site answers with an empty label: the 0-calorie bug.) */
export const labelUrl = (hallId: string, iso: string, labelKey: string) =>
  `${BASE_URL}/label.aspx?locationNum=${hallId}&dtdate=${dtdate(iso)}&RecNumAndPort=${labelKey}`;

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

export type Label = { nutrition: Nutrition; allergens?: string };

/** The label's numbers, or null when the page has no readable calorie line (label missing). */
export function parseLabel(html: string): Label | null {
  const cal = html.match(/<b>Calories&nbsp;(\d+(?:\.\d+)?)<\/b>/i);
  if (!cal) return null;
  const num = (re: RegExp) => {
    const m = html.match(re);
    return m ? parseFloat(m[1]) : undefined;
  };
  const serving = html.match(/Serving Size&nbsp;<\/font><font[^>]*>([^<]+)<\/font>/i);
  const allergens = html.match(/<span class="labelallergensvalue">([^<]+)<\/span>/i);
  return {
    nutrition: {
      calories: Math.round(parseFloat(cal[1])),
      servingSize: serving ? decodeText(serving[1]) : undefined,
      proteinG: num(/<b>Protein&nbsp;<\/b><\/font><font[^>]*>([\d.]+)g/i),
      carbsG: num(/<b>Tot\. Carb\.&nbsp;<\/b><\/font><font[^>]*>([\d.]+)g/i),
      fatG: num(/<b>Total Fat&nbsp;<\/b><\/font><font[^>]*>([\d.]+)g/i),
      fiberG: num(/Dietary Fiber&nbsp;<\/font><font[^>]*>([\d.]+)g/i),
      sugarsG: num(/Sugars&nbsp;<\/font><font[^>]*>([\d.]+)g/i),
      sodiumMg: num(/<b>Sodium&nbsp;<\/b><\/font><font[^>]*>([\d.]+)mg/i),
    },
    allergens: allergens ? decodeText(allergens[1]) || undefined : undefined,
  };
}

/** Fetches one page: its HTML, or null when the request failed or the site answered with an error. */
export type GetPage = (url: string) => Promise<string | null>;

export interface DayOptions {
  get: GetPage;
  /** Categories on the menu every meal (data/dish-kinds.json standingCategories): a meal with only these is not served. */
  standing: Set<string>;
  /** Labels by "recipe*portion" key, shared across halls and days. Missing labels are not stored, so a later run retries. */
  labels: Map<string, Label>;
  /** Called after each hall, e.g. to print progress or save the label cache. */
  onHall?: (hallId: HallId, counts: Partial<Record<MealName, number>>) => void;
}

/** One meal at one hall: every line on the long menu with its label numbers; [] when only standing items are listed. */
async function hallMeal(o: DayOptions, hall: { id: HallId; name: string }, iso: string, meal: MealName): Promise<Dish[]> {
  const html = await o.get(longMenuUrl(hall.id, hall.name, iso, meal));
  if (html === null) throw new Error(`long menu unreachable: hall ${hall.id} ${meal} ${iso}`);
  const items = parseLongMenu(html);
  // The long menu lists the standing items (salad bar, condiments, drinks...) even when the hall is closed for that meal.
  // A meal with nothing but standing items is not being served.
  if (!items.some((it) => !o.standing.has(it.category))) return [];
  const dishes: Dish[] = [];
  for (const it of items) {
    let l = o.labels.get(it.labelKey) ?? null;
    if (!l) {
      const page = await o.get(labelUrl(hall.id, iso, it.labelKey));
      l = page ? parseLabel(page) : null;
      if (l) o.labels.set(it.labelKey, l);
    }
    dishes.push({
      recipeId: it.recipeId,
      name: it.name,
      category: it.category,
      portion: it.portion ?? l?.nutrition.servingSize,
      ...(l ? { nutrition: l.nutrition } : {}),
      ...(l?.allergens ? { allergens: l.allergens } : {}),
      ...(it.tags.length ? { tags: it.tags } : {}),
    });
  }
  return dishes;
}

/** Every hall's menu for one date, read the way the site shows it: the short menu says which meals a hall serves that day
 *  (none when it is closed), the long menu gives each meal's lines, the label page each line's numbers. Throws when a menu
 *  page can't be reached, so a failed request never saves or serves a day with meals missing. */
export async function fetchDay(o: DayOptions, iso: string): Promise<DayMenu[]> {
  const menus: DayMenu[] = [];
  for (const hall of SITE_HALLS) {
    const short = await o.get(shortMenuUrl(hall.id, hall.name, iso));
    if (short === null) throw new Error(`short menu unreachable: hall ${hall.id} ${iso}`);
    const listed = new Set(mealsOffered(short));
    const meals: Partial<Record<MealName, Dish[]>> = {};
    const counts: Partial<Record<MealName, number>> = {};
    for (const meal of SITE_MEALS) {
      const dishes = listed.has(meal) ? await hallMeal(o, hall, iso, meal) : [];
      counts[meal] = dishes.length;
      if (dishes.length) meals[meal] = dishes;
    }
    menus.push({ date: iso, hallId: hall.id, meals });
    o.onHall?.(hall.id, counts);
  }
  return menus;
}
