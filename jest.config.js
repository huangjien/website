// Jest configuration without next/jest to avoid SWC binding issues on some platforms.
module.exports = {
  setupFiles: ["<rootDir>/jest.env.setup.js"],
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "<rootDir>/test-setup.js",
    "<rootDir>/src/setupTests.js",
  ],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.d.ts",
    "!src/pages/_app.js",
    "!src/pages/_document.js",
    "!src/pages/api/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  // Removed @heroui from ignore patterns; only transpile ahooks from node_modules
  transformIgnorePatterns: ["node_modules/(?!(ahooks)/)"],
};
