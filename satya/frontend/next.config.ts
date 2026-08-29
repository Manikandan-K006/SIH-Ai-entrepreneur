import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output when NOT building on Vercel (e.g. for Docker)
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;


