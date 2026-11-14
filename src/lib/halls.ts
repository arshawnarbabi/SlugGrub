// The five dining halls. Shared file (ask before changing).
// Hours are not on the menu site; Ethan fills HALL_HOURS by hand from dining.ucsc.edu.

import type { Hall, HallHours, MealPlan } from "./types";

export const HALLS: Hall[] = [
  { id: "40", name: "John R. Lewis & College Nine Dining Hall", short: "JRL/C9", colleges: ["John R. Lewis", "College Nine"] },
  { id: "05", name: "Cowell & Stevenson Dining Hall", short: "Cowell/Stevenson", colleges: ["Cowell", "Stevenson"] },
  { id: "20", name: "Crown & Merrill Dining Hall", short: "Crown/Merrill", colleges: ["Crown", "Merrill"] },
  { id: "25", name: "Porter & Kresge Dining Hall", short: "Porter/Kresge", colleges: ["Porter", "Kresge"] },
  { id: "30", name: "Rachel Carson & Oakes Dining Hall", short: "Carson/Oakes", colleges: ["Rachel Carson", "Oakes"] },
];

export const HALL_HOURS: HallHours[] = [
  // TODO (Ethan): real hours per hall and meal
];

export const MEAL_PLANS: MealPlan[] = [
  // 2025-26 numbers from dining.ucsc.edu; check for 2026-27
  { id: "blue", label: "Blue", pointsPerQuarter: 1359 },
  { id: "gold", label: "Gold", pointsPerQuarter: 1905 },
  { id: "banana-slug", label: "Banana Slug", pointsPerQuarter: 2592 },
  { id: "unlimited", label: "Unlimited", pointsPerQuarter: 75 }, // cafe and market points only
];
