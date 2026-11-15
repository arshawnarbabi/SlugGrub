// Owner: Arshawn. Photo log. The server picks each hall's demo plate for every meal today (src/components/screens/demoPlates.ts:
// a real dish on that meal's menu with a generated image), so "Use a demo plate" always sends a dish the menu really has.
import { LogScreen } from "@/components/screens/LogScreen";
import { demoPlates } from "@/components/screens/demoPlates";

export default async function Page() {
  return <LogScreen demo={await demoPlates()} />;
}
