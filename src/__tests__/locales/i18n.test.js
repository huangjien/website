// Provide a minimal plugin for i18next.use(initReactI18next)
jest.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

const { default: i18n, languages } = require("../../locales/i18n");

describe("i18n initialization", () => {
  it("exports a non-empty languages list containing 'en'", () => {
    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBeGreaterThan(0);
    const codes = languages.map((l) => l.key);
    expect(codes).toContain("en");
  });

  it("initializes with fallbackLng 'en' and default language 'en'", () => {
    const opts = i18n?.options || {};
    const fallback = opts.fallbackLng;
    if (Array.isArray(fallback)) {
      expect(fallback[0]).toBe("en");
    } else {
      expect(fallback).toBe("en");
    }
    // Depending on i18next state, language may be 'en' or array; handle both
    if (typeof i18n.language === "string") {
      expect(i18n.language).toContain("en");
    } else if (Array.isArray(i18n.languages)) {
      expect(i18n.languages[0]).toContain("en");
    }
  });

  it("provides English translations from resources", () => {
    // 'global.search' exists in en.json and should be accessible
    const text = i18n.t("global.search");
    expect(typeof text).toBe("string");
    expect(text.toLowerCase()).toContain("search");
  });
});
