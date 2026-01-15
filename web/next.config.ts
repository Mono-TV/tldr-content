import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Image optimization with remote patterns
  images: {
    // Enable modern image formats (WebP/AVIF) for better compression
    formats: ['image/avif', 'image/webp'],
    // Device breakpoints for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for srcset generation
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384],
    // Cache optimized images for 7 days
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // Optimize bundle size with modularized imports
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // Enable experimental optimizations
  experimental: {
    // Enable optimized package imports for better tree-shaking
    optimizePackageImports: ['framer-motion', '@tanstack/react-query', 'lucide-react'],
  },
};

export default withBundleAnalyzer(nextConfig);
