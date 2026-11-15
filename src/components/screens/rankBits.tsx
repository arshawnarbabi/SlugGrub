// Owner: Arshawn (UI). Small shared pieces for the ranking screens (Rank, Vote, projector, Dining services).
import { RiceBowl01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { HALLS as HALL_LIST } from "@/lib/halls";
import type { HallId } from "@/lib/types";
import { qrMatrix } from "@/lib/qr";
import { HALL_COLORS } from "./hallColors";
import { dishPhoto } from "./dishPhoto";

export const hallShort = (id: HallId) => HALL_LIST.find((h) => h.id === id)?.short ?? id;
export const hallColor = (id: HallId) => HALL_COLORS[id] ?? "var(--ink-3)";

/** A dish's generated image, or the neutral dish tile (paper-2 with the rice bowl) when it has none yet. */
export function DishThumb({ name, w, h, r = 12 }: { name: string; w: number | string; h: number; r?: number }) {
  const src = dishPhoto(name);
  if (src) return <Photo src={src} w={w} h={h} r={r} />;
  return (
    <div className="ph" style={{ width: w, height: h, borderRadius: r, display: "grid", placeItems: "center", color: "var(--ink-3)" }} aria-hidden>
      <Icon icon={RiceBowl01Icon} size={typeof w === "number" && w < 60 ? 20 : 28} />
    </div>
  );
}

/** A real, scannable QR code (src/lib/qr.ts) drawn as SVG: ink modules on white with a two-module quiet zone. */
export function QrCode({ value, size, label }: { value: string; size: number | string; label?: string }) {
  const m = qrMatrix(value);
  if (!m) return null;
  const n = m.length, q = 2;
  const runs: React.ReactNode[] = [];
  m.forEach((row, y) => {
    for (let x = 0; x < n; x++) {
      if (!row[x]) continue;
      let w = 1;
      while (x + w < n && row[x + w]) w++;
      runs.push(<rect key={`${y}-${x}`} x={x + q} y={y + q} width={w} height={1} />);
      x += w - 1;
    }
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n + 2 * q} ${n + 2 * q}`} role="img" aria-label={label ?? `QR code for ${value}`} shapeRendering="crispEdges"
      style={{ flex: "0 0 auto", display: "block", borderRadius: 8, background: "white" }}>
      <g style={{ fill: "var(--ink)" }}>{runs}</g>
    </svg>
  );
}

/** "2026-11-09" -> "Nov 9". */
export const shortDate = (ymd: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${ymd}T12:00:00Z`));
