// Owner: Karen (data). The projector view of the live vote: big QR code, the tally moving, the hall leaderboard, Next round.
// UI: src/components/screens/VoteScreen.tsx (Arshawn).
import { VoteProjector } from "@/components/screens/VoteScreen";
import { cachedCatalog } from "@/lib/rankCatalog";

export default async function Page() {
  const catalog = await cachedCatalog();
  return <VoteProjector catalog={catalog.dishes} />;
}
