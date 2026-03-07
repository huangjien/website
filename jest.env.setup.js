const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const root = __dirname;
// Load .env.test.local first, then .env.test, then regular env files
const envFiles = [".env.test.local", ".env.test", ".env.local", ".env"]; // test files take priority

for (const filename of envFiles) {
  const fullPath = path.join(root, filename);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath });
  }
}

module.exports = {};
