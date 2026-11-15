import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev only: lets a phone on the same wifi load the app (Arshawn's laptop address; update it if the network changes)
  allowedDevOrigins: ["169.233.246.213"],
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Menu files are read from disk at runtime (src/lib/menus.ts builds their paths), so the tracer can't see them: include them in
  // every server route's trace so deployed builds (Vercel) have them.
  outputFileTracingIncludes: {
    "/": ["./data/menus/*.json", "./data/cafes.json"],
    "/*": ["./data/menus/*.json", "./data/cafes.json"],
    "/api/*": ["./data/menus/*.json", "./data/cafes.json"],
  },
  // CSS goes through PostCSS (postcss.config.mjs). The @tailwindcss/turbopack loader rule was removed on 2026-11-14: it cached
  // globals.css and kept serving the original starter stylesheet in dev and in production builds.
};

export default nextConfig;
