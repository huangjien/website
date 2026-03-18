import { resources } from "../resources";
import en from "../en.json";
import de from "../de.json";
import es from "../es.json";
import fr from "../fr.json";
import itLocale from "../it.json";
import zh_CN from "../zh_CN.json";
import zh_TW from "../zh_TW.json";

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

describe("i18n parity", () => {
  it("ensures runtime resources expose all english keys", () => {
    const baseKeys = flattenKeys(resources.en.translation);

    Object.entries(resources).forEach(([locale, namespace]) => {
      const localeKeys = new Set(flattenKeys(namespace.translation));
      const missing = baseKeys.filter((key) => !localeKeys.has(key));
      expect(missing).toEqual([]);
    });
  });

  it("keeps strict locales in raw key parity with english", () => {
    const strictLocales = {
      de,
      es,
      fr,
      it: itLocale,
      zh_CN,
      zh_TW,
    };

    const baseKeys = flattenKeys(en);

    Object.entries(strictLocales).forEach(([locale, value]) => {
      const localeKeys = new Set(flattenKeys(value));
      const missing = baseKeys
        .filter((key) => !localeKeys.has(key))
        .filter((key) => !TRANSITIONAL_KEYS.has(key));
      expect(missing).toEqual([]);
    });
  });
});
