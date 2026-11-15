// Owner: Arshawn. Each dining hall's color, a design token (--c-jrl ... in globals.css), for hall dots and bars on the
// ranking screens.
import type { HallId } from "@/lib/types";

export const HALL_COLORS: Record<HallId, string> = {
  "40": "var(--c-jrl)",
  "05": "var(--c-cowell)",
  "20": "var(--c-crown)",
  "25": "var(--c-porter)",
  "30": "var(--c-oakes)",
};
