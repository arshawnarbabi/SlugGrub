// Owner: Arshawn. Today tab (PLAN.md, "Today page cards"). The server reads rankings, menus and hours for every hall once a
// minute at most (cacheLife "minutes", so the page still opens static); TodayView picks the student's hall, college, plan and
// points from the profile saved on this device (onboarding), which the server can't see.
import { cacheLife } from "next/cache";
import { getTopDishNow, getAllDishes, getCollegeRivalry } from "@/lib/rankings";
import { getMenu } from "@/lib/menus";
import { HALLS, mealNow } from "@/lib/halls";
import type { HallId } from "@/lib/types";
import { dishPhoto } from "./dishPhoto";
import { campusNow, greeting } from "./now";
import { TodayView, type TodayData, type TodayHall } from "./TodayView";

async function loadToday(): Promise<TodayData> {
  "use cache";
  cacheLife("minutes");
  const now = campusNow(new Date());
  const [all, rivalry] = await Promise.all([getAllDishes(), getCollegeRivalry()]);
  const halls = await Promise.all(HALLS.map(async (h): Promise<[HallId, TodayHall]> => {
    const [top, menu] = await Promise.all([getTopDishNow(h.id), getMenu(now.date, h.id)]);
    const dish = top ? Object.values(menu?.meals ?? {}).flat().find((d) => d?.recipeId === top.recipeId) : undefined;
    const pair = all.filter((d) => d.hallId === h.id && dishPhoto(d.name)).slice(0, 2).map((d) => ({ name: d.name, photo: dishPhoto(d.name) }));
    return [h.id, {
      short: h.short,
      status: mealNow(h.id, now.date, now.minutes),
      top: top && { name: top.name, votes: top.votes, photo: dishPhoto(top.name), cal: dish?.nutrition?.calories ?? top.calories, portion: dish?.portion ?? undefined },
      pair,
    }];
  }));
  const best = [...all].sort((a, b) => b.elo - a.elo || b.votes - a.votes).slice(0, 4).map((d) => ({
    name: d.name, hall: HALLS.find((h) => h.id === d.hallId)?.short ?? "", cal: d.calories, photo: dishPhoto(d.name), elo: Math.round(d.elo),
  }));
  return { hello: greeting(now.minutes), halls: Object.fromEntries(halls) as Record<HallId, TodayHall>, rivalry: rivalry.map((r) => ({ college: r.college, rank: r.rank })), best };
}

export async function TodayScreen() {
  return <TodayView data={await loadToday()} />;
}
