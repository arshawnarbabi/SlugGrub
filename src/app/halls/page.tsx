// Owner: Ethan (data). UI: src/components/screens/HallsScreen.tsx (Arshawn).
// The halls' menus for today, trimmed on the server (src/lib/hallsView.ts) and read through a one-minute cache, so the page
// opens static while the meal and hours follow the campus clock (Pacific time).
import { cacheLife } from "next/cache";
import { HallsScreen } from "@/components/screens/HallsScreen";
import { getHallsData } from "@/lib/hallsView";
import { campusClock } from "@/lib/campusTime";
import { getAllDishes } from "@/lib/rankings";
import { HALLS } from "@/lib/halls";
import { dishPhoto } from "@/components/screens/dishPhoto";

async function loadHalls() {
  "use cache";
  cacheLife("minutes");
  const [data, all] = await Promise.all([getHallsData(campusClock(new Date())), getAllDishes()]);
  // best on campus today: highest rated dishes that have a photo, for the carousel (rankings, src/lib/rankings.ts)
  // one card per dish name (the same dish is served at several halls), the higher rated serving first
  const seen = new Set<string>();
  const best = [...all].filter((d) => dishPhoto(d.name)).sort((a, b) => b.elo - a.elo || b.votes - a.votes)
    .filter((d) => (seen.has(d.name) ? false : (seen.add(d.name), true))).slice(0, 6)
    .map((d) => ({ name: d.name, hallId: d.hallId, hallShort: HALLS.find((h) => h.id === d.hallId)?.short ?? "", photo: dishPhoto(d.name)!, votes: d.votes }));
  return { data, best };
}

export default async function Page() {
  const { data, best } = await loadHalls();
  return <HallsScreen data={data} best={best} />;
}
