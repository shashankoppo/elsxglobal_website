/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint is enforced in CI (npm run lint). Skip during Docker build
    // to avoid any <a>-vs-Link or rule-version discrepancy blocking deploys.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript is enforced in CI (npm run typecheck). Skip during Docker build
    // so a Coolify deploy is never blocked by type errors that CI already catches.
    ignoreBuildErrors: true,
  },
  images: {
    // Re-enabled Next.js image optimization for better performance
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://api.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://checkout.razorpay.com https://lottie.host",
              "frame-src https://api.razorpay.com https://checkout.razorpay.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  experimental: {
    // Windows EAGAIN workaround — only applied on Windows hosts
    ...(process.platform === 'win32'
      ? { workerThreads: false, cpus: 4 }
      : {}),
  },
  webpack: (config) => {
    if (process.platform === 'win32') {
      config.cache = false;
      // Force serial processing to reduce concurrent fs calls (Windows workaround)
      config.parallelism = 1;
    }
    return config;
  },
};

module.exports = nextConfig;
