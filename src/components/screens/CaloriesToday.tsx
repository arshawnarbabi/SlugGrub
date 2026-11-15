"use client";

// Owner: Arshawn. Today card 6 (PLAN.md): calories today, private, one line. Reads the plates saved on this device only.
import Link from "next/link";
import { ArrowRight01Icon, FireIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { useCaloriesToday } from "./plates";

export function CaloriesToday() {
  const today = useCaloriesToday();
  const none = today !== null && today.plates === 0;
  return (
    <Link href="/log" className="card tight press link" style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 32 }}>
      <span className="card-chev" aria-hidden><Icon icon={ArrowRight01Icon} size={16} sw={2} /></span>
      <span className="iconbtn" style={{ width: 44, height: 44, borderRadius: 12, background: "var(--paper-2)" }}><Icon icon={FireIcon} size={20} sw={2} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontSize: 14 }}>Calories today</b>
        <div className="label" style={{ fontSize: 12 }}>{none ? "Log a plate to start · only you see this" : "Only you see this"}</div>
      </div>
      {today !== null && !none && <span className="num" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.03em" }}>{today.calories.toLocaleString("en-US")}</span>}
    </Link>
  );
}
