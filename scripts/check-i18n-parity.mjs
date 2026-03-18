import fs from "node:fs/promises";
import path from "node:path";

const LOCALES_DIR = path.resolve("src/locales");
const BASE_LOCALE = "en";
const SOFT_ALLOWED_MISSING = new Set(["ar", "ga", "ja", "ko", "ru"]);
const TRANSITIONAL_KEYS = new Set([
  "global.unauthorized",
  "ai.model_auto_fallback",
  "ai.copy",
  "ai.copied",
  "ai.copy_failed",
  "ai.select_voice",
  "ai.voice_note",
  "issue.rows_per_page",
  "settings.table_aria_label",
  "smart_image.load_failed",
  "smart_image.try_direct_link",
  "performance.error_title",
  "performance.retry",
  "performance.empty_title",
  "performance.opened_on",
]);

const flattenKeys = (obj, prefix = "") => {
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) {
    return [];
  }

  return Object.entries(obj).flatMap(([key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      return flattenKeys(value, next);
    }
    return [next];
  });
};

const readJson = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const main = async () => {
  const entries = await fs.readdir(LOCALES_DIR);
  const localeFiles = entries.filter((name) => name.endsWith(".json"));

  const baseFile = `${BASE_LOCALE}.json`;
  if (!localeFiles.includes(baseFile)) {
    throw new Error(`Missing base locale file: ${baseFile}`);
  }

  const base = await readJson(path.join(LOCALES_DIR, baseFile));
  const baseKeys = new Set(flattenKeys(base));

  const report = {};
  let hardFailures = 0;

  for (const file of localeFiles) {
    const locale = file.replace(".json", "");
    if (locale === BASE_LOCALE) continue;

    const content = await readJson(path.join(LOCALES_DIR, file));
    const keys = new Set(flattenKeys(content));

    const missing = [...baseKeys]
      .filter((key) => !keys.has(key))
      .filter((key) => !TRANSITIONAL_KEYS.has(key))
      .sort();
    const extra = [...keys].filter((key) => !baseKeys.has(key)).sort();

    const isSoftAllowed = SOFT_ALLOWED_MISSING.has(locale);
    if (missing.length > 0 && !isSoftAllowed) {
      hardFailures += 1;
    }

    report[locale] = {
      missingCount: missing.length,
      extraCount: extra.length,
      missingPreview: missing.slice(0, 20),
      extraPreview: extra.slice(0, 20),
      strict: !isSoftAllowed,
    };
  }

  const output = {
    baseLocale: BASE_LOCALE,
    generatedAt: new Date().toISOString(),
    locales: report,
    hardFailures,
  };

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (hardFailures > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
