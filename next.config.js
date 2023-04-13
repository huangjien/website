/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  // compiler: {
  //   removeConsole: { exclude: ['error'] },
  // },
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
