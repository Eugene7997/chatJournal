import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**', // allow all paths
      },
      {
        protocol: "https",
        hostname: "s.gravatar.com",
        pathname: "/**",
      },
    ],
  }
};

export default nextConfig;
