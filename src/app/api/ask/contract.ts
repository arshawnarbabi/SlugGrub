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

// ── Streaming (2026-11-15): POST with `Accept: application/x-ndjson` and the answer comes back as one JSON event per line while
// it is worked out; without that header the route returns one AskResponse as before. Checks that fail before any work starts
// (bad_request, too_long, rate_limited, no_key) still come back as a plain JSON AskError with its status, in both modes.
export const ASK_STREAM_TYPE = "application/x-ndjson";

/** What the server is doing right now; each is a real step, sent when it starts (the Ask screen's action line shows `text`). */
export type AskStepKind =
  | "menus" // reading today's menus
  | "halls" // which halls and meals are open now, by name
  | "asking" // the Gemini call has started
  | "thinking" // one of Gemini's own thought summaries (its heading)
  | "writing" // the answer text is streaming
  | "matching"; // matching the picks to the UCSC labels

export type AskEvent =
  | { type: "step"; step: AskStepKind; text: string }
  | { type: "delta"; text: string } // the next piece of the answer; the pieces join into AskResult.answer
  | { type: "picks"; picks: AskPick[] }
  | { type: "done"; result: AskResult } // always last on success; result.answer is the full answer
  | { type: "error"; error: AskErrorCode; message: string }; // always last on failure
