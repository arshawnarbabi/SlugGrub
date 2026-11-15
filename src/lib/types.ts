// Shared data types. Everyone codes against these.
// Shared file: add optional fields freely, but ask the team before renaming or removing anything.

export type HallId = "40" | "05" | "20" | "25" | "30";

export type MealName = "Breakfast" | "Lunch" | "Dinner" | "Late Night";

export type College =
  | "Cowell"
  | "Stevenson"
  | "Crown"
  | "Merrill"
  | "Porter"
  | "Kresge"
  | "Oakes"
  | "Rachel Carson"
  | "College Nine"
  | "John R. Lewis";

export interface Hall {
  id: HallId;
  name: string; // "Cowell & Stevenson Dining Hall"
  short: string; // "Cowell/Stevenson"
  colleges: College[];
}

export interface Nutrition {
  servingSize?: string; // as printed on the UCSC label
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  sugarsG?: number;
  sodiumMg?: number;
}

export interface Dish {
  recipeId: string; // UCSC recipe number, stable across days
  name: string;
  category: string; // "Entrees", "Soups", ...
  portion?: string; // official portion, e.g. "1 cup"
  nutrition?: Nutrition;
  allergens?: string;
}

export interface DayMenu {
  date: string; // YYYY-MM-DD
  hallId: HallId;
  meals: Partial<Record<MealName, Dish[]>>;
}

export interface HallHours {
  hallId: HallId;
  meal: MealName;
  open: string; // "17:00"
  close: string; // "20:00"
}

// Ranking (Karen)
export interface DishRank {
  recipeId: string;
  name: string;
  hallId: HallId;
  elo: number;
  votes: number;
  wins?: number; // matchups won (votes - wins = matchups lost)
  skips?: number; // times students skipped it ("haven't tried")
  calories?: number; // UCSC label calories per official portion, when the menu has it (dish info, never a user's intake)
}

export interface Vote {
  winnerRecipeId: string;
  loserRecipeId: string;
  userId: string;
  college?: College;
  at: string; // ISO time
  winnerHallId?: HallId; // a dish is ranked per hall: hallId + recipeId
  loserHallId?: HallId;
  matchId?: string; // one vote per user per matchup per day ("<date>_<keyA>_<keyB>") or per live round ("live-<roundId>")
  delta?: number; // Elo points the winner gained and the loser lost (kept so an undo can reverse it)
}

export interface HallStanding {
  hallId: HallId;
  rank: number;
  score: number;
  change: number; // places moved since last week, + is up (0 when openingRank is unknown)
  openingRank?: number; // rank in last week's closing standings, when a snapshot exists
}

// Budget and onboarding (Ethan)
export type MealPlanId = "blue" | "gold" | "banana-slug" | "unlimited";

export interface MealPlan {
  id: MealPlanId;
  label: string;
  pointsPerQuarter: number; // 2025-26 numbers, check dining.ucsc.edu for 2026-27
}

export interface UserProfile {
  plan: MealPlanId;
  pointsNow: number;
  college: College;
  usualHall: HallId;
}

export interface BudgetSnapshot {
  pointsLeft: number;
  daysLeft: number;
  pace: "on-pace" | "fast" | "slow";
  runOutDate?: string; // YYYY-MM-DD, if spending too fast
  leftoverAtQuarterEnd?: number; // if spending slowly
}

// Photo log (Arshawn). Private to the user.
export interface PlateItem {
  recipeId: string;
  name: string;
  servings: number; // 1 = the official portion
  calories: number; // label calories x servings
}

export interface PlateLog {
  id: string;
  at: string; // ISO time
  hallId: HallId;
  meal: MealName;
  items: PlateItem[];
  totalCalories: number;
}
