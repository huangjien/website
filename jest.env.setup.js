const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const root = __dirname;
const envFiles = [".env", ".env.local", ".env.test", ".env.test.local"]; // load in order

for (const filename of envFiles) {
  const fullPath = path.join(root, filename);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath });
  }
}

module.exports = {};