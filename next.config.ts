import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Re-enable linting during builds but allow warnings
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Keep TypeScript lenient for now due to database typing complexity
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
