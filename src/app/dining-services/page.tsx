// Owner: Karen (data). UI: src/components/screens/DiningServicesScreen.tsx (Arshawn).
import { DiningServicesScreen } from "@/components/screens/DiningServicesScreen";
import { cachedCatalog } from "@/lib/rankCatalog";

export default async function Page() {
  const catalog = await cachedCatalog();
  return <DiningServicesScreen catalog={catalog.dishes} />;
}
