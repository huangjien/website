/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

// const path = require('path')

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  transpilePackages: ['ahooks'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true,
    // removeConsole: { exclude: ['error'] },
  },
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
