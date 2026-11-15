// Owner: Ethan (data). UI: src/components/screens/HallsScreen.tsx (Arshawn).
// The halls' menus for today, trimmed on the server (src/lib/hallsView.ts) and read through a one-minute cache, so the page
// opens static while the meal and hours follow the campus clock (Pacific time).
import { cacheLife } from "next/cache";
import { HallsScreen } from "@/components/screens/HallsScreen";
import { getHallsData } from "@/lib/hallsView";
import { campusClock } from "@/lib/campusTime";

async function loadHalls() {
  "use cache";
  cacheLife("minutes");
  return getHallsData(campusClock(new Date()));
}

export default async function Page() {
  return <HallsScreen data={await loadHalls()} />;
}
