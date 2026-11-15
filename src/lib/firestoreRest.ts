// Owner: Karen. Server only: reads the ranking collections through Firestore's REST API (public reads, firestore.rules), for
// server-rendered numbers such as Today's top pick and leaderboard. Plain fetch with a 3 s timeout, so a slow or missing project can
// never hang a render or `next build`; null on any failure (callers then show the menus with no votes). UNVERIFIED until a
// Firebase project is configured.
import { firebaseConfig, firebaseConfigured } from "./firebase";
import { emptyState, type DishStat, type LiveRound, type RankState } from "./rankCore";
import type { College } from "./types";

type Value = { integerValue?: string; doubleValue?: number; stringValue?: string; booleanValue?: boolean; nullValue?: null; timestampValue?: string; mapValue?: { fields?: Record<string, Value> } };
type Doc = { name: string; fields?: Record<string, Value> };

function decode(v: Value): unknown {
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.mapValue) return fields(v.mapValue.fields);
  return null;
}
const fields = (f?: Record<string, Value>) => Object.fromEntries(Object.entries(f ?? {}).map(([k, v]) => [k, decode(v)]));
const idOf = (d: Doc) => d.name.slice(d.name.lastIndexOf("/") + 1);

const base = () => `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

async function get(path: string): Promise<unknown | null> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${base()}/${path}${sep}key=${encodeURIComponent(firebaseConfig.apiKey)}`, { signal: AbortSignal.timeout(3000), cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore REST ${res.status}`);
  return res.json();
}

async function list(path: string): Promise<Doc[]> {
  const out: Doc[] = [];
  let token = "";
  for (let page = 0; page < 20; page++) {
    const r = (await get(`${path}?pageSize=300${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`)) as { documents?: Doc[]; nextPageToken?: string } | null;
    out.push(...(r?.documents ?? []));
    if (!r?.nextPageToken) break;
    token = r.nextPageToken;
  }
  return out;
}

/** The same RankState the browser builds from onSnapshot, read once. Null when unconfigured or unreachable. */
export async function restState(week: string): Promise<RankState | null> {
  if (!firebaseConfigured) return null;
  try {
    const [dishes, colleges, board, live] = await Promise.all([
      list("dishes"),
      list(`rivalry/${week}/colleges`),
      get(`boards/${week}`) as Promise<Doc | null>,
      get("live/current") as Promise<Doc | null>,
    ]);
    const state = emptyState(week);
    state.dishes = Object.fromEntries(dishes.map((d) => [idOf(d), fields(d.fields) as unknown as DishStat]));
    state.colleges = Object.fromEntries(colleges.map((d) => [idOf(d), Number(fields(d.fields).votes ?? 0)])) as Partial<Record<College, number>>;
    state.opening = board ? ((fields(board.fields).ranks as RankState["opening"]) ?? null) : null;
    state.round = live ? (fields(live.fields) as unknown as LiveRound) : null;
    return state;
  } catch (err) {
    console.warn("[rankings] Firestore read failed:", err);
    return null;
  }
}
