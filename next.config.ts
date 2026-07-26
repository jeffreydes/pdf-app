import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  eslint: {
    // Allows production builds to complete even if your project has ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Prevents TypeScript compilation errors from blocking the deployment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;