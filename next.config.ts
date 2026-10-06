import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
        remotePatterns: [
      // Images uploaded from /admin (keep in sync with components/ArtImage.tsx)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
