// Owner: Karen (data). UI: src/components/screens/RankScreen.tsx (Arshawn).
// Today's rankable dishes come from the real menus through a one-minute cache; live Elo and standings load in the browser.
import { RankScreen } from "@/components/screens/RankScreen";
import { cachedCatalog } from "@/lib/rankCatalog";

export default async function Page() {
  const catalog = await cachedCatalog();
  return <RankScreen catalog={catalog.dishes} />;
}
