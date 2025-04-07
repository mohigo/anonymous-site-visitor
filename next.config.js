/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all development indicators
  devIndicators: {
    position: 'bottom-right',
  },
  experimental: {
    disableOptimizedLoading: true,
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  // Temporarily ignore TypeScript and ESLint errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable output file tracing for better production builds
  output: 'standalone',
  // Optimize images for production
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config, { isServer }) => {
    // Exclude problematic modules from webpack processing
    config.externals = [...(config.externals || []), '@mapbox/node-pre-gyp'];

    // Add fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    return config;
  },
  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig; 