// Owner: Arshawn. Demo mode switch (docs/DECISIONS.md, "Demo mode"): any page opened with ?demo=1 turns it on, ?demo=0 turns it
// off, and the choice is remembered on this device (localStorage). Browser only: read it on the client after hydration (useDemoMode,
// or an effect or event handler), never during a server render (cacheComponents: pages open static). When it is on, the ranking screens show mock data built in the browser
// (src/lib/rankDemo.ts) and nothing is read from or written to Firebase.
import { useSyncExternalStore } from "react";

const KEY = "sluggrub.demo";
let fallback: boolean | null = null; // when localStorage is blocked, the switch still holds for this page load

export function demoOn(): boolean {
  if (typeof window === "undefined") return false;
  let q: string | null = null;
  try { q = new URLSearchParams(window.location.search).get("demo"); } catch { /* no URL: keep the saved choice */ }
  if (q === "1" || q === "0") {
    fallback = q === "1";
    try { window.localStorage.setItem(KEY, q); } catch { /* blocked storage: the in-memory fallback holds it */ }
    return fallback;
  }
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "1" || saved === "0") return saved === "1";
  } catch { /* blocked storage */ }
  return fallback ?? false;
}

const noSubscribe = () => () => {};
/** For screens: false on the server and while hydrating, then the device's switch. */
export function useDemoMode(): boolean {
  return useSyncExternalStore(noSubscribe, demoOn, () => false);
}
