// Owner: Ethan. What /api/ask takes and returns (the Ask screen codes against this).
import type { HallId, MealName } from "@/lib/types";

export const ASK_MAX_CHARS = 200;

export interface AskRequest {
  question: string;
}

export interface AskPick {
  recipeId: string;
  name: string;
  hallId: HallId;
  hallShort: string;
  meal: MealName;
  open: boolean; // being served right now (else later today)
  when: string; // "open till 8 PM", "opens at 5 PM"
  portion?: string;
  calories?: number; // UCSC label, per official portion; undefined when the dish has no label
  proteinG?: number;
  reason: string; // Gemini's few words on why it fits
}

export interface AskResult {
  ok: true;
  question: string;
  answer: string; // one or two sentences
  picks: AskPick[];
  menuDate: string; // the day the menus came from
  fallback: boolean; // true when today's menus weren't saved and the nearest day was used
}

export type AskErrorCode = "bad_request" | "too_long" | "rate_limited" | "no_menu" | "no_key" | "out_of_credits" | "gemini_error";

export interface AskError {
  ok: false;
  error: AskErrorCode;
  message: string; // shown to the student as is
}

export type AskResponse = AskResult | AskError;
