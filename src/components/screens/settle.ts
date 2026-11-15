// Owner: Arshawn. Today's numbers move from what Today last showed to what is true now (2026-11-15: a plate saved on Log fills the
// calorie ring on THE spring and the Slug Points number morphs down to its visit's charge, the next time Today shows). Pages still
// open static: the value Today showed last time is drawn first, in place, and the change runs a moment after the screen has opened.
// What Today last showed is kept for this tab only (sessionStorage, wrapped; a memory copy when storage is blocked).
import { useEffect, useState } from "react";

const KEY = "sluggrub.today.seen";
const memory: Record<string, number> = {};
const AFTER_OPEN_MS = 450; // just past ScreenClock's 400ms opening

function readAll(): Record<string, number> {
  try { return { ...memory, ...JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}") }; } catch { return { ...memory }; }
}
function readSeen(key: string): number | undefined {
  const v = readAll()[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
function writeSeen(key: string, value: number) {
  memory[key] = value;
  try { window.sessionStorage.setItem(KEY, JSON.stringify({ ...readAll(), [key]: value })); } catch { /* blocked storage: memory holds it */ }
}

/** The value to draw: what Today last showed for `key`, then (a moment after opening) the current value. Null while `value` is. */
export function useSettle(key: string, value: number | null): number | null {
  const [shown, setShown] = useState<number | null>(null);
  // until this card has moved once, it draws what Today last showed (read in the browser only: value is null on the server). Read on
  // every render, not once, because Next keeps Today mounted but hidden while another page is open, and the change happens then.
  const drawn = value === null ? null : shown ?? readSeen(key) ?? value;
  useEffect(() => {
    if (value === null || drawn === null) return;
    if (drawn === value) { writeSeen(key, value); return; }
    const t = window.setTimeout(() => setShown(value), AFTER_OPEN_MS);
    return () => window.clearTimeout(t);
  }, [key, value, drawn]);
  return drawn;
}
