// The five dining halls. Shared file (ask before changing).
// Hours are not on the menu site; typed by hand from dining.ucsc.edu/locations-hours (regular serving schedule, checked
// 2026-11-14). Special-day hours (holidays, finals) are not included.

import type { Hall, HallHours, HallId, MealName, MealPlan } from "./types";
import { clockLabel, toMinutes, weekdayOf } from "./campusTime";

export const HALLS: Hall[] = [
  { id: "40", name: "John R. Lewis & College Nine Dining Hall", short: "JRL/C9", colleges: ["John R. Lewis", "College Nine"] },
  { id: "05", name: "Cowell & Stevenson Dining Hall", short: "Cowell/Stevenson", colleges: ["Cowell", "Stevenson"] },
  { id: "20", name: "Crown & Merrill Dining Hall", short: "Crown/Merrill", colleges: ["Crown", "Merrill"] },
  { id: "25", name: "Porter & Kresge Dining Hall", short: "Porter/Kresge", colleges: ["Porter", "Kresge"] },
  { id: "30", name: "Rachel Carson & Oakes Dining Hall", short: "Carson/Oakes", colleges: ["Rachel Carson", "Oakes"] },
];

type Slot = [MealName, string, string];
const BREAKFAST_8: Slot = ["Breakfast", "08:00", "11:00"];
const BREAKFAST_7: Slot = ["Breakfast", "07:00", "11:00"];
const LUNCH: Slot = ["Lunch", "11:30", "14:00"];
const DINNER: Slot = ["Dinner", "17:00", "20:00"];
const LATE: Slot = ["Late Night", "20:00", "22:00"];
// Weekend brunch is 9 AM to 2 PM; the menu site lists it as a Breakfast menu and a Lunch menu, so we show Breakfast until 11
// and Lunch after (the brunch line is open the whole time).
const BRUNCH: Slot[] = [["Breakfast", "09:00", "11:00"], ["Lunch", "11:00", "14:00"]];

// [Sunday, Monday, ..., Saturday]
const WEEK: Record<HallId, Slot[][]> = {
  // College Nine/John R. Lewis: Mon no late night; Tue-Fri late night; Sat brunch, dinner, late night; Sun brunch, dinner
  "40": [
    [...BRUNCH, DINNER],
    [BREAKFAST_8, LUNCH, DINNER],
    [BREAKFAST_8, LUNCH, DINNER, LATE], [BREAKFAST_8, LUNCH, DINNER, LATE], [BREAKFAST_8, LUNCH, DINNER, LATE], [BREAKFAST_8, LUNCH, DINNER, LATE],
    [...BRUNCH, DINNER, LATE],
  ],
  // Cowell/Stevenson: Mon-Thu late night; Fri none; Sat brunch, dinner; Sun brunch, dinner, late night
  "05": [
    [...BRUNCH, DINNER, LATE],
    [BREAKFAST_8, LUNCH, DINNER, LATE], [BREAKFAST_8, LUNCH, DINNER, LATE], [BREAKFAST_8, LUNCH, DINNER, LATE], [BREAKFAST_8, LUNCH, DINNER, LATE],
    [BREAKFAST_8, LUNCH, DINNER],
    [...BRUNCH, DINNER],
  ],
  // Crown/Merrill: Mon-Fri breakfast from 7; closed weekends
  "20": [[], [BREAKFAST_7, LUNCH, DINNER], [BREAKFAST_7, LUNCH, DINNER], [BREAKFAST_7, LUNCH, DINNER], [BREAKFAST_7, LUNCH, DINNER], [BREAKFAST_7, LUNCH, DINNER], []],
  // Porter/Kresge: Mon-Fri breakfast from 7, dinner till 7; closed weekends
  "25": [[], ...Array.from({ length: 5 }, (): Slot[] => [BREAKFAST_7, LUNCH, ["Dinner", "17:00", "19:00"]]), []],
  // Rachel Carson/Oakes: same pattern as Cowell/Stevenson
  "30": [
    [...BRUNCH, DINNER, LATE],
    [BREAKFAST_8, LUNCH, DINNER, LATE], [BREAKFAST_8, LUNCH, DINNER, LATE], [BREAKFAST_8, LUNCH, DINNER, LATE], [BREAKFAST_8, LUNCH, DINNER, LATE],
    [BREAKFAST_8, LUNCH, DINNER],
    [...BRUNCH, DINNER],
  ],
};

const toHours = (hallId: HallId, slots: Slot[]): HallHours[] => slots.map(([meal, open, close]) => ({ hallId, meal, open, close }));

/** A hall's serving hours on a given date (YYYY-MM-DD, campus calendar), in order. Empty when the hall is closed that day. */
export function hallHoursOn(hallId: HallId, date: string): HallHours[] {
  return toHours(hallId, WEEK[hallId]?.[weekdayOf(date)] ?? []);
}

/** A typical weekday (Tuesday) for every hall. Prefer hallHoursOn(hallId, date): hours differ by day and two halls close on
 *  weekends. Kept as a flat list for callers written against it (now.ts hoursFor). */
export const HALL_HOURS: HallHours[] = HALLS.flatMap((h) => toHours(h.id, WEEK[h.id][2]));

export interface MealNow {
  meal: MealName | null; // the meal being served now, else the next one today, else null (done for the day / closed)
  open: boolean; // serving right now
  text: string; // "open till 8 PM", "opens at 5 PM", "closed today", "closed for the day"
}

/** What a hall is doing at `minutes` past midnight on `date` (both campus time). */
export function mealNow(hallId: HallId, date: string, minutes: number): MealNow {
  const hours = hallHoursOn(hallId, date);
  if (!hours.length) return { meal: null, open: false, text: "closed today" };
  const now = hours.find((h) => minutes >= toMinutes(h.open) && minutes < toMinutes(h.close));
  if (now) {
    // the hall stays open while one meal hands straight over to the next (brunch into lunch, dinner into late night), so say
    // when the hall actually closes, not when this meal ends (his catch 2026-11-14: JRL/C9 on a Saturday is open till 10 PM)
    let close = now.close;
    for (let next = hours.find((h) => h.open === close); next; next = hours.find((h) => h.open === close)) close = next.close;
    return { meal: now.meal, open: true, text: `open till ${clockLabel(close)}` };
  }
  const next = hours.find((h) => toMinutes(h.open) > minutes);
  if (next) return { meal: next.meal, open: false, text: `opens at ${clockLabel(next.open)}` };
  return { meal: null, open: false, text: "closed for the day" };
}

export const MEAL_PLANS: MealPlan[] = [
  // 2026-27 Slug Points per quarter from dining.ucsc.edu/plans-pricing/meal-plans (checked 2026-11-14)
  { id: "blue", label: "Blue", pointsPerQuarter: 1452 },
  { id: "gold", label: "Gold", pointsPerQuarter: 2037 },
  { id: "banana-slug", label: "Banana Slug", pointsPerQuarter: 2772 },
  { id: "unlimited", label: "Unlimited", pointsPerQuarter: 100 }, // 7-day and 5-day unlimited: 100 Slug Points for cafes and markets
];
