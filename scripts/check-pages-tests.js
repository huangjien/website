const fs = require("fs");
const path = require("path");

const pagesDir = path.join(process.cwd(), "src", "pages");

const forbiddenDirs = new Set(["__tests__", "__mocks__"]);
const forbiddenSuffixes = [".test.js", ".test.jsx", ".spec.js", ".spec.jsx"];

function walk(currentDir, violations = []) {
  if (!fs.existsSync(currentDir)) {
    return violations;
  }

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relativePath = path.relative(process.cwd(), fullPath);

    if (entry.isDirectory()) {
      if (forbiddenDirs.has(entry.name)) {
        violations.push(relativePath);
        continue;
      }
      walk(fullPath, violations);
      continue;
    }

    if (forbiddenSuffixes.some((suffix) => entry.name.endsWith(suffix))) {
      violations.push(relativePath);
    }
  }

  return violations;
}

const violations = walk(pagesDir);

if (violations.length > 0) {
  const details = violations.map((item) => ` - ${item}`).join("\n");
  console.error(
    "Found test files under src/pages. Move them outside src/pages to avoid Next.js build routing issues:\n" +
      details,
  );
  process.exit(1);
}

process.exit(0);
