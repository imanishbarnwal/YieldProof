/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // Enable React 19 features
  reactStrictMode: true,

  // Configure allowed dev origins for cross-origin requests
  allowedDevOrigins: [
    '10.142.96.245',
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
  ],

  // Disable development warnings in production
  productionBrowserSourceMaps: false,

  // Enable experimental features for better performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },

  // Turbopack configuration (Next.js 16+ default)
  turbopack: {
    // Empty config to silence the warning - Turbopack works fine with defaults
  },

  // Headers for better security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
