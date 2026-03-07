/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui"],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/static/**',
      },
      {
        protocol: 'https',
        hostname: 'genwear.io.vn',
        pathname: '/static/**',
      },
      {
        protocol: 'https',
        hostname: 'api.genwear.io.vn',
        pathname: '/static/**',
      },
    ],
  },
};

module.exports = nextConfig;
