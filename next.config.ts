import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
