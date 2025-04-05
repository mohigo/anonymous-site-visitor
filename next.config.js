/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all development indicators and analytics
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Disable Vercel Analytics and Speed Insights
  vercelAnalytics: false,
  experimental: {
    disableOptimizedLoading: true,
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  // Disable telemetry
  typescript: {
    ignoreBuildErrors: false,
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