export default {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.js"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "staticDirs": ['../public'],
  "docs": {
    "autodocs": "tag"
  }
};