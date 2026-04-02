import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance: compress responses
  compress: true,
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Use modern formats
    formats: ['image/avif', 'image/webp'],
  },

  // Production optimizations
  reactStrictMode: true,

  // Reduce unused JS
  experimental: {
    optimizeCss: false, // Disable if causing issues; enable with critters
  },
};

export default nextConfig;
