"use client";

// Owner: Arshawn (shared shell). Page change = a quick content cross-fade, like switching tabs on iOS 18+ (his ask 2026-11-14:
// "a simple very quick fade of the content ... i dont want any like card animations"). Opacity only, 180ms; the nav bar lives in
// the layout, so it never fades. Reduced motion: instant.
import { motion, useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18, ease: "easeOut" }} style={{ position: "absolute", inset: 0 }}>
      {children}
    </motion.div>
  );
}
