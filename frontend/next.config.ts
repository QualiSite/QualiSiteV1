import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  allowedDevOrigins: ["caesura", "100.109.50.124"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "qualisite.alithiel31.dev" },
      { protocol: "https", hostname: "qualisite.fr" },
      { protocol: "https", hostname: "images.unsplash.com" },

    ],
  },
};

export default nextConfig;