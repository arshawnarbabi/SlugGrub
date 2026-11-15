// Owner: Ethan (data). UI: src/components/screens/OnboardingScreen.tsx (Arshawn). The hall step previews one of today's dishes at
// each hall (src/components/screens/demoPlates.ts, the same picks as Log's demo plate).
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { demoPlates } from "@/components/screens/demoPlates";

export default async function Page() {
  return <OnboardingScreen dishes={await demoPlates()} />;
}
