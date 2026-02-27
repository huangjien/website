/** @type {import('next').NextConfig} */

const withSerwist = require("@serwist/next").default({
  swSrc: "src/sw.js",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  register: false,
  exclude: [
    ({ asset }) => {
      const excludeList = [
        /\.map$/,
        /^manifest.*\.js$/,
        /^server\//,
        /^(((app-)?build-manifest|react-loadable-manifest|dynamic-css-manifest)\.json)$/,
      ];
      return excludeList.some((r) => r.test(asset.name));
    },
  ],
});

// const path = require('path')

const nextConfig = {
  // output: "standalone",
  reactStrictMode: true,
  devIndicators: false,
  transpilePackages: ["ahooks"],
  compiler: {
    styledComponents: true,
    removeConsole: { exclude: ["error"] },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "user-images.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/robots.txt",
        destination: "/api/robots",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|webp|ico|woff|woff2|ttf|eot)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(js|css)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = withSerwist(nextConfig);
// module.exports = nextConfig;
