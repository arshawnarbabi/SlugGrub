// Owner: Ethan. Menu fetcher: see PLAN.md, "Menu data". Saves to data/menus/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import type { DayMenu, HallId, MealName, Dish, Nutrition } from "../src/lib/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CA_PATH = path.join(__dirname, "incommon-ca.pem");

// InCommon ECC OV SSL CA 3 intermediate certificate PEM
// Needed because UCSC FoodPro server provides an RSA chain for an ECC leaf certificate.
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

if (!fs.existsSync(CA_PATH)) {
  fs.writeFileSync(CA_PATH, INCOMMON_CA_PEM, "utf8");
}

// Fix TLS leaf signature verification by supplying the missing Sectigo/InCommon intermediate CA
if (!process.env.NODE_EXTRA_CA_CERTS && fs.existsSync(CA_PATH)) {
  process.env.NODE_EXTRA_CA_CERTS = CA_PATH;
  const res = spawnSync(
    process.execPath,
    ["--experimental-strip-types", __filename, ...process.argv.slice(2)],
    {
      stdio: "inherit",
      env: { ...process.env, NODE_EXTRA_CA_CERTS: CA_PATH },
    }
  );
  process.exit(res.status ?? 0);
}

const BASE_URL = "https://nutrition.sa.ucsc.edu";

const HALLS: { id: HallId; name: string }[] = [
  { id: "40", name: "John R. Lewis & College Nine Dining Hall" },
  { id: "05", name: "Cowell & Stevenson Dining Hall" },
  { id: "20", name: "Crown & Merrill Dining Hall" },
  { id: "25", name: "Porter & Kresge Dining Hall" },
  { id: "30", name: "Rachel Carson & Oakes Dining Hall" },
];

const MEALS: MealName[] = ["Breakfast", "Lunch", "Dinner", "Late Night"];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let cookieHeader = "";

async function getCookies(): Promise<string> {
  if (cookieHeader) return cookieHeader;
  const res = await fetch(`${BASE_URL}/`);
  const setCookies = res.headers.getSetCookie
    ? res.headers.getSetCookie()
    : [res.headers.get("set-cookie") || ""];
  cookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");
  return cookieHeader;
}

// Nutrition cache to avoid duplicate fetches for the same recipe
const CACHE_FILE = path.join(__dirname, "..", "data", "nutrition-cache.json");
let nutritionCache: Record<string, { nutrition: Nutrition; allergens?: string; servingSize?: string }> = {};

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      nutritionCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    } catch {
      nutritionCache = {};
    }
  }
}

function saveCache() {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(nutritionCache, null, 2), "utf8");
}

function decodeText(raw: string): string {
  let text = raw
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
  try {
    text = decodeURIComponent(text);
  } catch {
    // Keep text as-is if it contains stray '%' characters
  }
  return text.trim();
}

function parseNutrition(html: string): { nutrition: Nutrition; allergens?: string } {
  const servingMatch = html.match(/Serving Size&nbsp;<\/font><font[^>]*>([^<]+)<\/font>/i);
  const calMatch = html.match(/<b>Calories&nbsp;(\d+)<\/b>/i);
  const fatMatch = html.match(/<b>Total Fat&nbsp;<\/b><\/font><font[^>]*>([\d\.]+)g/i);
  const carbMatch = html.match(/<b>Tot\. Carb\.&nbsp;<\/b><\/font><font[^>]*>([\d\.]+)g/i);
  const fiberMatch = html.match(/Dietary Fiber&nbsp;<\/font><font[^>]*>([\d\.]+)g/i);
  const sugarMatch = html.match(/Sugars&nbsp;<\/font><font[^>]*>([\d\.]+)g/i);
  const proteinMatch = html.match(/<b>Protein&nbsp;<\/b><\/font><font[^>]*>([\d\.]+)g/i);
  const sodiumMatch = html.match(/<b>Sodium&nbsp;<\/b><\/font><font[^>]*>([\d\.]+)mg/i);
  const allergensMatch = html.match(/<span class="labelallergensvalue">([^<]+)<\/span>/i);

  const calories = calMatch ? parseInt(calMatch[1], 10) : 0;
  const nutrition: Nutrition = {
    calories,
    servingSize: servingMatch ? decodeText(servingMatch[1]) : undefined,
    proteinG: proteinMatch ? parseFloat(proteinMatch[1]) : undefined,
    carbsG: carbMatch ? parseFloat(carbMatch[1]) : undefined,
    fatG: fatMatch ? parseFloat(fatMatch[1]) : undefined,
    fiberG: fiberMatch ? parseFloat(fiberMatch[1]) : undefined,
    sugarsG: sugarMatch ? parseFloat(sugarMatch[1]) : undefined,
    sodiumMg: sodiumMatch ? parseFloat(sodiumMatch[1]) : undefined,
  };

  return {
    nutrition,
    allergens: allergensMatch ? decodeText(allergensMatch[1]) : undefined,
  };
}

async function fetchNutrition(
  hallId: string,
  dateMmDdYyyy: string,
  recipeId: string,
  portionCode: string
): Promise<{ nutrition: Nutrition; allergens?: string }> {
  const cacheKey = `${recipeId}*${portionCode}`;
  if (nutritionCache[cacheKey]) {
    return nutritionCache[cacheKey];
  }

  await sleep(150); // Be polite
  try {
    const cookies = await getCookies();
    const url = `${BASE_URL}/label.aspx?locationNum=${hallId}&dtdate=${encodeURIComponent(
      dateMmDdYyyy
    )}&RecNumAndPort=${encodeURIComponent(cacheKey)}`;
    const res = await fetch(url, { headers: { Cookie: cookies } });
    if (!res.ok) {
      return { nutrition: { calories: 0 } };
    }
    const html = await res.text();
    const parsed = parseNutrition(html);
    nutritionCache[cacheKey] = parsed;
    return parsed;
  } catch (err) {
    console.warn(`Failed to fetch nutrition for ${cacheKey}:`, err);
    return { nutrition: { calories: 0 } };
  }
}

function parseLongMenu(html: string): { category: string; recipeId: string; portionCode: string; name: string; portion?: string }[] {
  const items: { category: string; recipeId: string; portionCode: string; name: string; portion?: string }[] = [];

  // Match category headers and dish link entries
  const regex = /<div class=['"]longmenucolmenucat['"]>--\s*([^-\n]+?)\s*--<\/div>|<div class=['"]longmenucoldispname['"]>[\s\S]*?<a href=['"]label\.aspx\?[^'"]*RecNumAndPort=([^*&'"]+)\*([^&'"]+)[^'"]*['"][^>]*>([\s\S]*?)<\/a>(?:[\s\S]*?<div class=['"]longmenucolportions['"]>([^<]*)<\/div>)?/g;

  let currentCategory = "General";
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      currentCategory = match[1].trim();
    } else if (match[2] && match[4]) {
      const recipeId = match[2].trim();
      const portionCode = match[3].trim();
      const name = match[4].replace(/&amp;/g, "&").trim();
      const portionRaw = match[5] ? match[5].replace(/&nbsp;/g, " ").trim() : undefined;
      items.push({
        category: currentCategory,
        recipeId,
        portionCode,
        name,
        portion: portionRaw && portionRaw.length > 0 ? portionRaw : undefined,
      });
    }
  }
  return items;
}

export async function fetchHallMenuForMeal(
  hall: { id: HallId; name: string },
  dateMmDdYyyy: string,
  mealName: MealName
): Promise<Dish[]> {
  const cookies = await getCookies();
  const url = `${BASE_URL}/longmenu.aspx?sName=UC+Santa+Cruz+Dining&locationNum=${
    hall.id
  }&locationName=${encodeURIComponent(hall.name)}&naFlag=1&dtdate=${encodeURIComponent(
    dateMmDdYyyy
  )}&mealName=${encodeURIComponent(mealName)}`;

  await sleep(200); // Be polite
  const res = await fetch(url, { headers: { Cookie: cookies } });
  if (!res.ok) return [];

  const html = await res.text();
  const parsedItems = parseLongMenu(html);
  const dishes: Dish[] = [];

  for (const item of parsedItems) {
    const { nutrition, allergens } = await fetchNutrition(
      hall.id,
      dateMmDdYyyy,
      item.recipeId,
      item.portionCode
    );

    dishes.push({
      recipeId: item.recipeId,
      name: item.name,
      category: item.category,
      portion: item.portion ?? nutrition.servingSize,
      nutrition,
      allergens,
    });
  }

  return dishes;
}

export async function fetchMenusForDate(dateStr?: string) {
  loadCache();

  // Format date: defaults to today (parse YYYY-MM-DD in local time to avoid UTC shift)
  let targetDate: Date;
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    targetDate = new Date(y, m - 1, d);
  } else {
    targetDate = dateStr ? new Date(dateStr) : new Date();
  }
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  const year = targetDate.getFullYear();
  const dateMmDdYyyy = `${month}/${day}/${year}`;
  const isoDate = `${year}-${month}-${day}`;

  console.log(`\nFetching UCSC dining menus for ${isoDate} (${dateMmDdYyyy})...`);

  const dayMenus: DayMenu[] = [];

  for (const hall of HALLS) {
    console.log(`\n[${hall.id}] ${hall.name}`);
    const mealsRecord: Partial<Record<MealName, Dish[]>> = {};

    for (const meal of MEALS) {
      process.stdout.write(`  - ${meal}... `);
      const dishes = await fetchHallMenuForMeal(hall, dateMmDdYyyy, meal);
      if (dishes.length > 0) {
        mealsRecord[meal] = dishes;
        console.log(`found ${dishes.length} dishes`);
      } else {
        console.log(`no menu`);
      }
    }

    const dayMenu: DayMenu = {
      date: isoDate,
      hallId: hall.id,
      meals: mealsRecord,
    };
    dayMenus.push(dayMenu);
  }

  // Save to data/menus/
  const outDir = path.join(__dirname, "..", "data", "menus");
  fs.mkdirSync(outDir, { recursive: true });

  const outFilePath = path.join(outDir, `${isoDate}.json`);
  fs.writeFileSync(outFilePath, JSON.stringify({ menus: dayMenus }, null, 2), "utf8");
  console.log(`\nSaved ${dayMenus.length} hall menus to ${outFilePath}`);

  saveCache();
  return dayMenus;
}

// When run directly from CLI
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
) {
  const argDate = process.argv[2];
  fetchMenusForDate(argDate)
    .then(() => {
      console.log("Menu fetch completed successfully.");
    })
    .catch((err) => {
      console.error("Error fetching menus:", err);
      process.exit(1);
    });
}
