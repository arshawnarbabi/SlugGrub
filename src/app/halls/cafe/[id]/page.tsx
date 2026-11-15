// Owner: Ethan (data). UI: src/components/screens/CafeMenuScreen.tsx (Arshawn).
// One cafe or market's full menu, opened from its row on the Halls tab. Built like /halls: every location the site lists is
// prerendered (generateStaticParams over SITE_CAFES) and its menu is read through a one-minute cache, so the page opens static while
// the open status follows the campus clock (Pacific time). An id that is not a location is a 404.
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { CafeMenuScreen } from "@/components/screens/CafeMenuScreen";
import { getCafeMenu } from "@/lib/hallsView";
import { campusClock } from "@/lib/campusTime";
import { SITE_CAFES } from "@/lib/foodpro";

export function generateStaticParams() {
  return SITE_CAFES.map((c) => ({ id: c.id }));
}

async function loadCafe(id: string) {
  "use cache";
  cacheLife("minutes");
  return getCafeMenu(id, campusClock(new Date()));
}

// The id is URL data, so it is read inside <Suspense> (instant navigation). Every location is prerendered and the board's links
// prefetch their page, so the shell (top bar with the back button) is all that shows before the menu, and usually not even that.
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<CafeMenuScreen c={null} />}>
      <Cafe params={params} />
    </Suspense>
  );
}

async function Cafe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cafe = await loadCafe(id);
  if (!cafe) notFound();
  return <CafeMenuScreen c={cafe} />;
}
