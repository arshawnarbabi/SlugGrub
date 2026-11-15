// Owner: Ethan. Cafe and market hours. Not on the menu site: typed by hand from each location's page on
// dining.ucsc.edu/locations-hours (regular hours, checked 2026-11-14; no special hours were posted). A location missing here has
// no posted hours, and the board says nothing about it being open rather than guess. Same wording as the halls (src/lib/halls.ts).
import { clockLabel, toMinutes, weekdayOf } from "./campusTime";

type Open = [string, string] | null; // [open, close] "HH:MM", null = closed that day
const weekdays = (open: string, close: string, friday: Open = [open, close]): Open[] =>
  [null, [open, close], [open, close], [open, close], [open, close], friday, null]; // [Sunday, ..., Saturday]

/** By FoodPro location number (SITE_CAFES in src/lib/foodpro.ts). */
const HOURS: Record<string, Open[]> = {
  "21": weekdays("20:00", "23:00"), // Banana Joe's Late Night
  "23": weekdays("10:00", "21:00"), // Oakes Cafe
  "46": weekdays("08:00", "18:00"), // Global Village Cafe
  "24": weekdays("08:00", "18:00"), // Owl's Nest
  "45": weekdays("08:00", "16:00", ["08:00", "14:00"]), // University Center Cafe (the UCen Coffee Bar)
  "26": weekdays("08:00", "20:00"), // Stevenson Coffee House
  "22": weekdays("08:00", "18:00", ["08:00", "17:00"]), // all three Perk Coffee Bars post the same hours
  "50": weekdays("08:00", "20:00"), // Porter Market
  "47": weekdays("09:00", "20:00"), // Merrill Market
};

export interface CafeNow {
  open: boolean;
  text: string; // "open till 6 PM", "opens at 8 AM", "closed for the day", "closed today"
}

/** What a cafe or market is doing at `minutes` past midnight on `date` (both campus time); null when it has no posted hours. */
export function cafeNow(id: string, date: string, minutes: number): CafeNow | null {
  const week = HOURS[id];
  if (!week) return null;
  const today = week[weekdayOf(date)];
  if (!today) return { open: false, text: "closed today" };
  const [open, close] = today;
  if (minutes < toMinutes(open)) return { open: false, text: `opens at ${clockLabel(open)}` };
  if (minutes >= toMinutes(close)) return { open: false, text: "closed for the day" };
  return { open: true, text: `open till ${clockLabel(close)}` };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** A location's posted week, days with the same hours grouped, Monday first: [{ days: "Mon to Thu", hours: "8 AM to 6 PM" },
 *  { days: "Fri", hours: "8 AM to 5 PM" }, { days: "Sat, Sun", hours: "Closed" }]. Empty when it has no posted hours. */
export function cafeWeek(id: string): { days: string; hours: string }[] {
  const week = HOURS[id];
  if (!week) return [];
  const order = [1, 2, 3, 4, 5, 6, 0];
  const text = (o: Open) => (o ? `${clockLabel(o[0])} to ${clockLabel(o[1])}` : "Closed");
  const groups: { from: number; to: number; hours: string }[] = [];
  for (const d of order) {
    const hours = text(week[d]);
    const last = groups[groups.length - 1];
    if (last && last.hours === hours) last.to = d;
    else groups.push({ from: d, to: d, hours });
  }
  return groups.map((g) => {
    const span = order.indexOf(g.to) - order.indexOf(g.from);
    const days = span === 0 ? DAY_NAMES[g.from] : span === 1 ? `${DAY_NAMES[g.from]}, ${DAY_NAMES[g.to]}` : `${DAY_NAMES[g.from]} to ${DAY_NAMES[g.to]}`;
    return { days, hours: g.hours };
  });
}
