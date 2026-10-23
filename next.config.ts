/**
 * COURTSIDE: คำอธิบายไฟล์
 * กำหนด Next.js สำหรับ origin ในเครื่อง ชุด TypeScript ที่ build ราก Turbopack และแหล่งภาพภายนอกที่อนุญาต
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  typescript: {
    tsconfigPath: "tsconfig.build.json",
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tospybqevfsihfitwuuf.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/tournament-posters/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
