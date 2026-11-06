/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Re-enabled: ESLint errors must be fixed, not silenced
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Re-enabled: Type errors must be fixed, not silenced
    ignoreBuildErrors: false,
  },
  images: {
    // Re-enabled Next.js image optimization for better performance
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  experimental: {
    // Windows EAGAIN workaround — can be removed on Linux/CI
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config) => {
    config.cache = false;
    // Force serial processing to reduce concurrent fs calls (Windows workaround)
    config.parallelism = 1;
    return config;
  },
};

module.exports = nextConfig;
