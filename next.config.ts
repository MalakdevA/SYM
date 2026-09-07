import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  allowedDevOrigins: [
    '10.0.0.174',
    '10.0.0.174:3000',
    '192.168.1.7',
    '192.168.1.7:3000',
    'localhost:3000'
  ],
  // Dev-only: proxies /api/* to the local PHP backend (php -S 127.0.0.1:8000 -t api)
  // so `next dev` doesn't 404 on the relative /api paths lib/api.ts uses in the browser.
  // Has no effect on the static export produced by `next build` (output: 'export').
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://127.0.0.1:8000/:path*' },
    ];
  },
  images: {
    qualities: [100, 75],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's7ap1.scene7.com',
      },
    ],
  },
};

export default nextConfig;
