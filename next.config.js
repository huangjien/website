/** @type {import('next').NextConfig} */
const nextConfig = {
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
