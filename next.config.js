/** @type {import('next').NextConfig} */
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

module.exports = nextConfig;
