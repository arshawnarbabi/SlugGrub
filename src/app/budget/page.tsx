// Owner: Ethan. Slug Points pace tracker.

import { getBudgetSnapshot } from "@/lib/budget";
import { BudgetClient } from "./BudgetClient";

export default async function BudgetPage() {
  const snapshot = await getBudgetSnapshot();
  return <BudgetClient fallbackSnapshot={snapshot} />;
}
