// Owner: Ethan. The campus clock for lib code. UCSC runs on Pacific time wherever the server is (Vercel runs on UTC).
// Pure: callers pass the time in (never read the clock during render: cacheComponents).

export interface CampusNow {
  date: string; // YYYY-MM-DD in Pacific time
  minutes: number; // minutes since midnight, Pacific
  weekday: number; // 0 = Sunday ... 6 = Saturday, Pacific
}

const FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

export function campusClock(d: Date): CampusNow {
  const p = Object.fromEntries(FMT.formatToParts(d).map((x) => [x.type, x.value]));
  const date = `${p.year}-${p.month}-${p.day}`;
  return { date, minutes: Number(p.hour) * 60 + Number(p.minute), weekday: weekdayOf(date) };
}

/** Day of the week of a calendar date (0 = Sunday). */
export const weekdayOf = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay();

/** Whole calendar days from a to b (both YYYY-MM-DD); no clock or time zone involved. */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** "17:00" -> "5 PM", "11:30" -> "11:30 AM" (sentence case UI). */
export function clockLabel(hhmm: string): string {
  const h = Number(hhmm.slice(0, 2)), m = hhmm.slice(3, 5);
  return `${h % 12 || 12}${m === "00" ? "" : `:${m}`} ${h < 12 ? "AM" : "PM"}`;
}
