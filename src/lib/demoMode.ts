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

const CHANGED = "sluggrub:demo";

/** Turns demo mode on or off from a button (Settings: Start demo, Leave demo). Drops a ?demo= left in the address bar, which would
 *  otherwise win over the new choice, and tells every screen using useDemoMode. */
export function setDemo(on: boolean) {
  fallback = on;
  try { window.localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* blocked storage: the in-memory fallback holds it */ }
  try {
    const u = new URL(window.location.href);
    if (u.searchParams.has("demo")) { u.searchParams.delete("demo"); window.history.replaceState(window.history.state, "", u); }
  } catch { /* no URL to tidy */ }
  window.dispatchEvent(new Event(CHANGED));
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGED, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(CHANGED, cb); window.removeEventListener("storage", cb); };
}
/** For screens: false on the server and while hydrating, then the device's switch (and again whenever setDemo changes it). */
export function useDemoMode(): boolean {
  return useSyncExternalStore(subscribe, demoOn, () => false);
}
