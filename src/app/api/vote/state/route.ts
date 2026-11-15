// Owner: Karen. Local fallback (no Firebase config): the whole ranking state for one reader, polled about every 2 s by
// src/lib/rankClient.ts. In-memory on this server only; production uses Firestore onSnapshot instead (see rankMemory.ts).
import type { NextRequest } from "next/server";
import { connection } from "next/server";
import { getCatalog, campusDate } from "@/lib/rankCatalog";
import { memState } from "@/lib/rankMemory";
import { weekOf } from "@/lib/rankCore";

export async function GET(req: NextRequest) {
  await connection(); // always at request time: the store changes with every vote
  const voter = req.nextUrl.searchParams.get("voter") ?? undefined;
  const date = campusDate();
  const catalog = await getCatalog(date);
  return Response.json(memState(catalog.dishes, weekOf(date), voter), { headers: { "Cache-Control": "no-store" } });
}
