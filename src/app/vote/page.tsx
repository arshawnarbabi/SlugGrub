// Owner: Karen (data). UI: src/components/screens/VoteScreen.tsx (Arshawn). The page judges reach from the QR code.
import { VoteScreen } from "@/components/screens/VoteScreen";
import { cachedCatalog } from "@/lib/rankCatalog";

export default async function Page() {
  const catalog = await cachedCatalog();
  return <VoteScreen catalog={catalog.dishes} />;
}
