// Owner: Arshawn. The campus clock: which meal it is and what to say about the hours. Pure functions; callers pass the time in
// (never read the clock during render: cacheComponents). UCSC runs on Pacific time wherever the server is.
import { HALL_HOURS } from "@/lib/halls";
import type { HallHours, HallId, MealName } from "@/lib/types";
import { DEMO_HOURS } from "./demo";

export const MEAL_NAMES: MealName[] = ["Breakfast", "Lunch", "Dinner", "Late Night"];
/** Sentence case for the screen (his rule: no title case or caps). */
export const mealLabel = (m: MealName) => (m === "Late Night" ? "Late night" : m);

/** Campus date (YYYY-MM-DD) and minutes since midnight, in Pacific time. */
export function campusNow(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(d).map((x) => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

/** This device's own date (YYYY-MM-DD), for logging plates on the student's day. */
export function localDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Hall hours from Ethan's HALL_HOURS; demo hours until he fills them in. */
export function hoursFor(hallId: HallId): HallHours[] {
  const real = HALL_HOURS.filter((h) => h.hallId === hallId);
  const list = real.length ? real : DEMO_HOURS.map((h) => ({ ...h, hallId }));
  return [...list].sort((a, b) => mins(a.open) - mins(b.open));
}

const mins = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const clock = (hhmm: string) => {
  const h = Number(hhmm.slice(0, 2)), m = hhmm.slice(3, 5);
  return `${h % 12 || 12}${m === "00" ? "" : `:${m}`} ${h < 12 ? "AM" : "PM"}`;
};

/** The meal to show now and a few words about it: "open till 8 PM", or "opens at 5 PM" between meals. */
export function mealStatus(hours: HallHours[], minutes: number): { meal: MealName; text: string } {
  const open = hours.find((h) => minutes >= mins(h.open) && minutes < mins(h.close));
  if (open) return { meal: open.meal, text: `open till ${clock(open.close)}` };
  const next = hours.find((h) => mins(h.open) > minutes) ?? hours[0];
  if (!next) return { meal: "Dinner", text: "hours not posted" };
  return { meal: next.meal, text: `opens at ${clock(next.open)}` };
}

/** The meal a plate most likely came from: the one open now, else the last one that opened today (you log after eating). */
export function mealToLog(hours: HallHours[], minutes: number): MealName {
  const started = hours.filter((h) => mins(h.open) <= minutes);
  return (started[started.length - 1] ?? hours[hours.length - 1])?.meal ?? "Dinner";
}

export function greeting(minutes: number) {
  return minutes < 12 * 60 ? "Good morning" : minutes < 17 * 60 ? "Good afternoon" : "Good evening";
}
