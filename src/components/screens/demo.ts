// Owner: Arshawn. DEMO content for the UI until Karen's rankings and Ethan's menus are real.
// Screens read from here; swap each export for the real data function (src/lib/*) as it lands. Numbers are made up.

export type DemoDish = { id: string; name: string; hall: string; cal: number; score: number; photo: string; portion: string; protein: number; carbs: number; fat: number };

const f = (n: string) => `/food/${n}.jpg`;

export const DISHES: Record<string, DemoDish> = {
  tikka: { id: "tikka", name: "Chicken Tikka Masala", hall: "JRL/C9", cal: 540, score: 9.1, photo: f("tikka"), portion: "1 cup", protein: 32, carbs: 30, fat: 30 },
  penne: { id: "penne", name: "Penne Arrabbiata", hall: "Cowell/Stevenson", cal: 480, score: 8.8, photo: f("penne"), portion: "1 cup", protein: 15, carbs: 62, fat: 16 },
  poke: { id: "poke", name: "Salmon Poke Bowl", hall: "Crown/Merrill", cal: 480, score: 8.9, photo: f("poke"), portion: "1 bowl", protein: 28, carbs: 52, fat: 14 },
  grain: { id: "grain", name: "Harvest Grain Bowl", hall: "Porter/Kresge", cal: 430, score: 8.6, photo: f("grain-bowl"), portion: "1 bowl", protein: 14, carbs: 58, fat: 15 },
  steak: { id: "steak", name: "Steak Salad", hall: "JRL/C9", cal: 420, score: 8.2, photo: f("steak-salad"), portion: "1 plate", protein: 31, carbs: 14, fat: 26 },
  pizza: { id: "pizza", name: "Flatbread Pizza", hall: "Every hall", cal: 290, score: 7.6, photo: f("pizza"), portion: "1 slice", protein: 12, carbs: 34, fat: 11 },
  salad: { id: "salad", name: "Garden Salad", hall: "Carson/Oakes", cal: 180, score: 7.4, photo: f("garden-salad"), portion: "1 bowl", protein: 6, carbs: 18, fat: 9 },
  pancakes: { id: "pancakes", name: "Buttermilk Pancakes", hall: "Cowell/Stevenson", cal: 350, score: 8.0, photo: f("pancakes"), portion: "3 pancakes", protein: 9, carbs: 58, fat: 9 },
  padthai: { id: "padthai", name: "Shrimp Pad Thai", hall: "JRL/C9", cal: 410, score: 8.3, photo: f("pad-thai"), portion: "1 cup", protein: 18, carbs: 52, fat: 14 },
  wrap: { id: "wrap", name: "Chicken Wrap", hall: "JRL/C9", cal: 520, score: 7.9, photo: f("wrap"), portion: "1 wrap", protein: 29, carbs: 48, fat: 22 },
};

export const MEALS = ["Breakfast", "Lunch", "Dinner", "Late night"] as const;
export type Meal = (typeof MEALS)[number];

export const MENU_BY_MEAL: Record<Meal, string[]> = {
  Breakfast: ["pancakes", "salad", "pizza"],
  Lunch: ["padthai", "wrap", "steak", "pizza"],
  Dinner: ["tikka", "steak", "pizza", "salad"],
  "Late night": ["pizza", "wrap"],
};
export const BEST_TONIGHT = ["poke", "penne", "grain", "tikka"];

export const HALLS = [
  { id: "40", short: "JRL/C9", color: "var(--c-jrl)", open: "Open till 8 PM", score: 1195, change: -2 },
  { id: "05", short: "Cowell/Stevenson", color: "var(--c-cowell)", open: "Open till 8 PM", score: 1238, change: 1 },
  { id: "20", short: "Crown/Merrill", color: "var(--c-crown)", open: "Open till 9 PM", score: 1251, change: 0 },
  { id: "25", short: "Porter/Kresge", color: "var(--c-porter)", open: "Open till 8 PM", score: 1210, change: 1 },
  { id: "30", short: "Carson/Oakes", color: "var(--c-oakes)", open: "Closed, opens 7 AM", score: 1170, change: 0 },
];

export const CAFES = [
  { name: "Global Village Cafe", item: "Iced oat latte", score: 8.7 },
  { name: "Owl's Nest Cafe", item: "Breakfast burrito", score: 8.4 },
  { name: "Banana Joe's", item: "Late night quesadilla", score: 8.1 },
];

export const DUELS: [string, string][] = [["padthai", "wrap"], ["tikka", "steak"], ["penne", "pizza"], ["poke", "grain"]];

export const USER = { name: "Maya", hall: "JRL/C9", college: "Porter", plan: "Gold", points: 1120, pointsTotal: 1905, daysLeft: 27, perDay: 41 };

// Made-up hours (same at every hall) until Ethan fills HALL_HOURS in src/lib/halls.ts. Read through hoursFor() in now.ts.
export const DEMO_HOURS: { meal: "Breakfast" | "Lunch" | "Dinner" | "Late Night"; open: string; close: string }[] = [
  { meal: "Breakfast", open: "07:00", close: "11:00" },
  { meal: "Lunch", open: "11:30", close: "14:00" },
  { meal: "Dinner", open: "17:00", close: "20:00" },
  { meal: "Late Night", open: "21:00", close: "23:00" },
];

/** A demo photo for a real dish name, until dishes carry photos: the demo dish whose name matches. */
export function dishPhoto(name: string): string | undefined {
  const n = name.toLowerCase();
  const hit = Object.values(DISHES).find((d) => d.name.toLowerCase() === n)
    ?? Object.values(DISHES).find((d) => n.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(n))
    ?? Object.values(DISHES).find((d) => d.name.toLowerCase().split(" ").pop() === n.split(" ").pop()); // "Cheese Pizza" -> a pizza
  return hit?.photo;
}
