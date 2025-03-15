import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['hwnromliwwgffeslhbii.supabase.co'],
    unoptimized: true,
  },
};

export default nextConfig;
