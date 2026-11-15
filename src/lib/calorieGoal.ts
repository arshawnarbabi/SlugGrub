// Owner: Arshawn. The optional daily calorie goal from onboarding (2026-11-15, his choice of the "optional step" design): Mifflin-St Jeor
// resting energy times an activity factor, rounded to 10. Pure; the inputs and the goal stay on the phone (src/lib/profile.ts).
//   BMR = 10 x kg + 6.25 x cm - 5 x age + 5 (male) or - 161 (female); "rather not say" uses the midpoint, - 78.
//   Activity: light 1.375 (mostly sitting, walking to class), moderate 1.55 (exercise 3 to 5 days a week), very 1.725 (hard exercise
//   most days). These are the standard Mifflin-St Jeor multipliers.
import type { CalorieGoal } from "./profile";

export const ACTIVITY = {
  light: { label: "Light", factor: 1.375, sub: "Mostly sitting, walking to class" },
  moderate: { label: "Moderate", factor: 1.55, sub: "Exercise or sports 3 to 5 days a week" },
  very: { label: "Very active", factor: 1.725, sub: "Hard training most days" },
} as const;
export type Activity = keyof typeof ACTIVITY;
export type Sex = NonNullable<CalorieGoal["sex"]>;

const SEX_K: Record<Sex, number> = { male: 5, female: -161, unsaid: -78 };

/** The formula's goal, or null when an input is missing or out of range. */
export function goalFromBody(b: { heightIn?: number; weightLb?: number; age?: number; sex?: Sex; activity?: Activity }): number | null {
  const { heightIn: h, weightLb: w, age: a, sex, activity } = b;
  if (!h || !w || !a || !sex || !activity) return null;
  if (h < 48 || h > 96 || w < 70 || w > 600 || a < 13 || a > 100) return null;
  const bmr = 10 * (w * 0.45359237) + 6.25 * (h * 2.54) - 5 * a + SEX_K[sex];
  return Math.round((bmr * ACTIVITY[activity].factor) / 10) * 10;
}
