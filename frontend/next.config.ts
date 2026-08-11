import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  // Hôtes supplémentaires autorisés à requêter le serveur de dev Next.js
  // (ex: accès via un hostname/IP local). Vide par défaut ; à définir
  // via NEXT_DEV_ALLOWED_ORIGINS="host1,host2" selon la machine de dev.
  allowedDevOrigins: process.env.NEXT_DEV_ALLOWED_ORIGINS?.split(",") ?? [],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "qualisite.alithiel31.dev" },
      { protocol: "https", hostname: "qualisite.fr" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${process.env.INTERNAL_API_URL ?? "http://localhost:3001"}/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${process.env.INTERNAL_API_URL ?? "http://localhost:3001"}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${process.env.INTERNAL_API_URL ?? "http://localhost:3001"}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;