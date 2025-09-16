/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "@google/generative-ai"],
  },

  // Compression
  compress: true,

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Bundle analyzer (uncomment to analyze bundle size)
  // bundlePagesRouterDependencies: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
