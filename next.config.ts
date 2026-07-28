import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_URL || 'http://3.82.47.4:5000/api';
    if (target.startsWith('http')) {
      const cleanTarget = target.replace(/\/api\/?$/, '');
      return [
        {
          source: '/api/:path*',
          destination: `${cleanTarget}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
