// Owner: Arshawn. Dish name -> its generated image (scripts/food-images.mjs writes public/food/gen/index.json).
// Returns null when a dish has no image yet; callers show the neutral dish tile instead of a wrong photo.
// A student's photo-log photo will replace these placeholders later (docs/DECISIONS.md, "Dish images").
import index from "../../../public/food/gen/index.json";

const MAP = index as Record<string, string>;
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const BY_NORM = new Map(Object.entries(MAP).map(([k, v]) => [norm(k), v]));

export function dishPhoto(name: string): string | null {
  return MAP[name] ?? BY_NORM.get(norm(name)) ?? null;
}
