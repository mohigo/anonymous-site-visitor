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
};

module.exports = nextConfig; 