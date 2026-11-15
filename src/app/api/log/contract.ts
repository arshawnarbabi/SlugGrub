// Owner: Arshawn. What POST /api/log returns, shared by the route and LogScreen. Types only (safe to import in the browser).
import type { HallId, MealName, PlateItem } from "@/lib/types";

/** Label numbers for one official portion, straight from the UCSC label (via getMenu). */
export interface PerServing {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** A PlateItem plus what the screen needs to recount it when the servings slider moves. */
export interface LogItem extends PlateItem {
  portion?: string; // the official portion the servings count in, e.g. "1 cup"
  per: PerServing; // label numbers for one portion
  confidence: "high" | "medium" | "low";
  noLabel?: boolean; // the menu has no nutrition label for this dish, so it counts 0 until one exists
}

export interface LogResult {
  ok: true;
  hallId: HallId;
  hallShort: string;
  meal: MealName;
  date: string;
  container: string; // what Gemini saw the food on: plate, bowl, flat plate, to-go box, unknown
  items: LogItem[];
  notOnMenu: string[]; // food Gemini saw that is not on this meal's menu (never counted)
  note?: string;
}

export type LogErrorCode = "no_key" | "bad_request" | "bad_image" | "no_menu" | "no_food" | "gemini_error";

export interface LogError {
  ok: false;
  error: LogErrorCode;
  message: string; // shown to the student as is
  notOnMenu?: string[];
}

export type LogResponse = LogResult | LogError;
