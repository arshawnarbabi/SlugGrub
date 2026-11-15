// Owner: Arshawn. Demo mode for the two screens whose rankings come from the server (Today, Halls): the same picks the server
// makes (src/components/screens/TodayScreen.tsx, src/app/halls/page.tsx, src/lib/rankings.ts getTopDishNow), redone in the browser
// over the demo state (src/lib/rankDemo.ts), so every screen agrees with the leaderboard while demo mode is on.
import type { DishRank } from "@/lib/types";
import { HALLS } from "@/lib/halls";
import { collegeStandings, dishKey, mergeDishes, type CatalogDish, type RankState } from "@/lib/rankCore";
import { dishPhoto } from "./dishPhoto";
import type { BestDish } from "./HallsScreen";
import type { TodayData, TodayHall } from "./TodayView";

type Demo = { state: RankState; today: CatalogDish[] };
const short = (hallId: string) => HALLS.find((h) => h.id === hallId)?.short ?? "";

/** Halls' "Best on campus": highest rated dishes with a photo, one card per dish name. */
export function demoBest(demo: Demo): BestDish[] {
  const seen = new Set<string>();
  return mergeDishes(demo.today, demo.state.dishes).filter((d) => dishPhoto(d.name))
    .filter((d) => (seen.has(d.name) ? false : (seen.add(d.name), true))).slice(0, 6)
    .map((d) => ({ name: d.name, hallId: d.hallId, hallShort: short(d.hallId), photo: dishPhoto(d.name)!, votes: d.votes }));
}

/** Today's cards with the demo numbers: each hall's #1 now and its pair, college ranks, best on campus (one row per dish name). */
export function demoToday(data: TodayData, demo: Demo): TodayData {
  const all: DishRank[] = mergeDishes(demo.today, demo.state.dishes);
  const key = (d: DishRank) => dishKey(d.hallId, d.recipeId);
  const halls = Object.fromEntries(Object.entries(data.halls).map(([id, h]): [string, TodayHall] => {
    const today = demo.today.filter((c) => c.hallId === id);
    const inMeal = new Set(today.filter((c) => h.status.meal && c.meals.includes(h.status.meal)).map((c) => c.key));
    const onToday = new Set(today.map((c) => c.key));
    const atHall = all.filter((d) => d.hallId === id);
    // a hall closed today keeps the server's answer (none), so Today still shows an open hall's #1 instead
    const pool = [atHall.filter((d) => inMeal.has(key(d))), atHall.filter((d) => onToday.has(key(d)))].find((p) => p.length > 0) ?? [];
    const top = [...pool].sort((a, b) => b.elo - a.elo || Number(!!dishPhoto(b.name)) - Number(!!dishPhoto(a.name)) || b.votes - a.votes)[0];
    const withPhoto = pool.filter((d) => dishPhoto(d.name));
    const pair = withPhoto.length >= 2 ? withPhoto.slice(0, 2).map((d) => ({ name: d.name, photo: dishPhoto(d.name) })) : h.pair;
    return [id, {
      ...h,
      top: top ? { name: top.name, votes: top.votes, photo: dishPhoto(top.name), cal: top.calories, portion: h.top?.name === top.name ? h.top.portion : undefined } : h.top,
      pair,
    }];
  })) as TodayData["halls"];
  return {
    ...data,
    halls,
    rivalry: collegeStandings(demo.state.colleges, all).map((r) => ({ college: r.college, rank: r.rank })),
    best: all.filter((d, i) => all.findIndex((x) => x.name === d.name) === i).slice(0, 4).map((d) => ({ name: d.name, hall: short(d.hallId), cal: d.calories, photo: dishPhoto(d.name), elo: Math.round(d.elo) })),
  };
}
