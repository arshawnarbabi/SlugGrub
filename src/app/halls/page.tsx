// Owner: Ethan. Halls list and each hall's menu, plus the cafe board.

import { Suspense } from "react";
import { connection } from "next/server";
import { getAllMenus, getCafes } from "@/lib/menus";
import { HallsClient } from "./HallsClient";

async function HallsContent() {
  await connection();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(new Date());
  const [menus, cafes] = await Promise.all([getAllMenus(today), getCafes()]);

  return <HallsClient initialMenus={menus} cafes={cafes} />;
}

export default function HallsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-neutral-400">Loading menus...</div>}>
      <HallsContent />
    </Suspense>
  );
}
