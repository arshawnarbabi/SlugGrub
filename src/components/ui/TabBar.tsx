"use client";

// Owner: Arshawn. Placeholder styling; the real design replaces it.

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Today" },
  { href: "/rank", label: "Rank" },
  { href: "/log", label: "Log", camera: true },
  { href: "/halls", label: "Halls" },
  { href: "/budget", label: "Budget" },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-background pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-center justify-around py-2 text-xs">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={
                  t.camera
                    ? "flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background"
                    : active
                      ? "font-semibold"
                      : "opacity-60"
                }
              >
                {t.camera ? "📷" : t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
