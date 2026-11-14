// Owner: Arshawn. One icon family: Hugeicons free, stroke rounded (DESIGN icons).
import { HugeiconsIcon } from "@hugeicons/react";

export type IconDef = Parameters<typeof HugeiconsIcon>[0]["icon"];

export function Icon({ icon, size = 18, sw = 1.8, color = "currentColor" }: { icon: IconDef; size?: number; sw?: number; color?: string }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={sw} color={color} />;
}
