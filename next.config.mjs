/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/docnum',
  assetPrefix: '/docnum/',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['qa-miniapp.med.hku.hk'],
    path: '/docnum/_next/image',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/docnum/api/:path*',
        destination: '/api/:path*',
      },
      {
        source: '/_next/static/:path*',
        destination: '/_next/static/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/callback/:path*',
        destination: '/api/auth/callback/:path*',
      },
      {
        source: '/:path*',
        destination: '/:path*',
      },
      {
        source: '/auth/error',
        destination: '/docnum/auth/error',
      },
      {
        source: '/auth/access-denied',
        destination: '/docnum/auth/access-denied',
      },
    ];
  },
};

export default nextConfig;