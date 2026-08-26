import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    let backendOrigin = process.env.BACKEND_PROXY_URL || process.env.BACKEND_INTERNAL_URL;

    if (!backendOrigin) {
      const publicApi = process.env.NEXT_PUBLIC_API_URL || '';
      if (publicApi && !publicApi.includes('storyhub.xpernex.com') && !publicApi.includes('consolestoryhub.xpernex.com')) {
        backendOrigin = publicApi.replace(/\/api\/?$/, '');
      } else {
        backendOrigin = 'http://44.205.31.67:5000';
      }
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
