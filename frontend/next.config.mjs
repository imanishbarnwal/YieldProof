/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable React 19 features
  reactStrictMode: true,
  
  // Enable Cache Components (new in 16.1.1)
  cacheComponents: true,
  
  // Enable experimental features for better performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },
};

export default nextConfig;
