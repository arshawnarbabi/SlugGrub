// Owner: Arshawn. The optional daily calorie goal from onboarding (2026-11-15, his choice of the "optional step" design): Mifflin-St Jeor
// resting energy times an activity factor, then the direction, rounded to 10. Pure; the inputs and the goal stay on the phone
// (src/lib/profile.ts).
//   BMR = 10 x kg + 6.25 x cm - 5 x age + 5 (male) or - 161 (female); "rather not say" uses the midpoint, - 78.
//   Activity: light 1.375 (mostly sitting, walking to class), moderate 1.55 (exercise 3 to 5 days a week), very 1.725 (hard exercise
//   most days). These are the standard Mifflin-St Jeor multipliers. Maintenance = BMR x factor.
//   Direction (2026-11-15, his ask: "you also have to ask if they want to gain weight or lose wieight or maintain"): lose = maintenance
//   - 500 (about a pound a week), maintain = maintenance, gain = maintenance + 300 (a slow, lean gain). The goal never goes below the
//   person's BMR, nor below 1,200 (female or rather not say) or 1,500 (male), whichever floor is higher; it is clamped silently.
//   5'10", 160 lb, 19, male, moderate: maintain 2,710, lose 2,210, gain 3,010.
import type { CalorieGoal } from "./profile";

export const ACTIVITY = {
  light: { label: "Light", factor: 1.375, sub: "Mostly sitting, walking to class" },
  moderate: { label: "Moderate", factor: 1.55, sub: "Exercise or sports 3 to 5 days a week" },
  very: { label: "Very active", factor: 1.725, sub: "Hard training most days" },
} as const;
export type Activity = keyof typeof ACTIVITY;
export type Sex = NonNullable<CalorieGoal["sex"]>;

/** What the student wants their eating to do. Copy stays about fueling, never dieting. */
export const DIRECTION = {
  lose: { label: "Lose weight", delta: -500, sub: "About 500 under what your day uses, roughly a pound a week" },
  maintain: { label: "Maintain", delta: 0, sub: "About what your day uses" },
  gain: { label: "Gain weight", delta: 300, sub: "About 300 over what your day uses, a slow, steady gain" },
} as const;
export type Direction = keyof typeof DIRECTION;

const SEX_K: Record<Sex, number> = { male: 5, female: -161, unsaid: -78 };
const FLOOR: Record<Sex, number> = { male: 1500, female: 1200, unsaid: 1200 };

/** Resting energy (Mifflin-St Jeor), or null when an input is missing or out of range. */
export function bmrFromBody(b: { heightIn?: number; weightLb?: number; age?: number; sex?: Sex }): number | null {
  const { heightIn: h, weightLb: w, age: a, sex } = b;
  if (!h || !w || !a || !sex) return null;
  if (h < 48 || h > 96 || w < 70 || w > 600 || a < 13 || a > 100) return null;
  return 10 * (w * 0.45359237) + 6.25 * (h * 2.54) - 5 * a + SEX_K[sex];
}

/** The formula's goal, or null when an input is missing or out of range. No direction means maintain (goals saved before it). */
export function goalFromBody(b: { heightIn?: number; weightLb?: number; age?: number; sex?: Sex; activity?: Activity; direction?: Direction }): number | null {
  const bmr = bmrFromBody(b);
  if (bmr === null || !b.sex || !b.activity) return null;
  const goal = bmr * ACTIVITY[b.activity].factor + DIRECTION[b.direction ?? "maintain"].delta;
  const floor = Math.max(bmr, FLOOR[b.sex]);
  // rounding never takes it back under the floor
  return goal <= floor ? Math.ceil(floor / 10) * 10 : Math.round(goal / 10) * 10;
}
