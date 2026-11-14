import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev only: lets a phone on the same wifi load the app (Arshawn's laptop address; update it if the network changes)
  allowedDevOrigins: ["169.233.246.213"],
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
