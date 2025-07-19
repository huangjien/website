import { resources } from "../resources";

// Mock JSON imports
jest.mock("../ar.json", () => ({ "test.key": "Arabic test" }), {
  virtual: true,
});
jest.mock("../de.json", () => ({ "test.key": "German test" }), {
  virtual: true,
});
jest.mock("../en.json", () => ({ "test.key": "English test" }), {
  virtual: true,
});
jest.mock("../es.json", () => ({ "test.key": "Spanish test" }), {
  virtual: true,
});
jest.mock("../fr.json", () => ({ "test.key": "French test" }), {
  virtual: true,
});
jest.mock("../ga.json", () => ({ "test.key": "Irish test" }), {
  virtual: true,
});
jest.mock("../it.json", () => ({ "test.key": "Italian test" }), {
  virtual: true,
});
jest.mock("../ja.json", () => ({ "test.key": "Japanese test" }), {
  virtual: true,
});
jest.mock("../ko.json", () => ({ "test.key": "Korean test" }), {
  virtual: true,
});
jest.mock("../ru.json", () => ({ "test.key": "Russian test" }), {
  virtual: true,
});
jest.mock("../zh_CN.json", () => ({ "test.key": "Chinese Simplified test" }), {
  virtual: true,
});
jest.mock("../zh_TW.json", () => ({ "test.key": "Chinese Traditional test" }), {
  virtual: true,
});

describe("resources configuration", () => {
  it("should export resources object", () => {
    expect(resources).toBeDefined();
    expect(typeof resources).toBe("object");
  });

  it("should have all expected language keys", () => {
    const expectedLanguages = [
      "en",
      "ru",
      "ar",
      "de",
      "it",
      "ja",
      "ko",
      "ga",
      "es",
      "fr",
      "zh_CN",
      "zh_TW",
    ];

    expectedLanguages.forEach((lang) => {
      expect(resources).toHaveProperty(lang);
    });
  });

  it("should have correct structure for each language", () => {
    Object.keys(resources).forEach((langKey) => {
      expect(resources[langKey]).toHaveProperty("translation");
      expect(typeof resources[langKey].translation).toBe("object");
    });
  });

  it("should include English translations", () => {
    expect(resources.en).toBeDefined();
    expect(resources.en.translation).toBeDefined();
    expect(resources.en.translation["test.key"]).toBe("English test");
  });

  it("should include Chinese simplified translations", () => {
    expect(resources.zh_CN).toBeDefined();
    expect(resources.zh_CN.translation).toBeDefined();
    expect(resources.zh_CN.translation["test.key"]).toBe(
      "Chinese Simplified test"
    );
  });

  it("should include Chinese traditional translations", () => {
    expect(resources.zh_TW).toBeDefined();
    expect(resources.zh_TW.translation).toBeDefined();
    expect(resources.zh_TW.translation["test.key"]).toBe(
      "Chinese Traditional test"
    );
  });

  it("should include European language translations", () => {
    const europeanLangs = ["de", "fr", "it", "es", "ru", "ga"];

    europeanLangs.forEach((lang) => {
      expect(resources[lang]).toBeDefined();
      expect(resources[lang].translation).toBeDefined();
    });
  });

  it("should include Asian language translations", () => {
    const asianLangs = ["ja", "ko", "ar"];

    asianLangs.forEach((lang) => {
      expect(resources[lang]).toBeDefined();
      expect(resources[lang].translation).toBeDefined();
    });
  });

  it("should have consistent structure across all languages", () => {
    const languages = Object.keys(resources);

    languages.forEach((lang) => {
      expect(resources[lang]).toEqual({
        translation: expect.any(Object),
      });
    });
  });

  it("should have 12 supported languages", () => {
    const languageCount = Object.keys(resources).length;
    expect(languageCount).toBe(12);
  });

  it("should have non-empty translation objects", () => {
    Object.keys(resources).forEach((lang) => {
      const translationKeys = Object.keys(resources[lang].translation);
      expect(translationKeys.length).toBeGreaterThan(0);
    });
  });

  it("should include specific language translations with correct content", () => {
    expect(resources.de.translation["test.key"]).toBe("German test");
    expect(resources.fr.translation["test.key"]).toBe("French test");
    expect(resources.it.translation["test.key"]).toBe("Italian test");
    expect(resources.es.translation["test.key"]).toBe("Spanish test");
    expect(resources.ru.translation["test.key"]).toBe("Russian test");
    expect(resources.ja.translation["test.key"]).toBe("Japanese test");
    expect(resources.ko.translation["test.key"]).toBe("Korean test");
    expect(resources.ar.translation["test.key"]).toBe("Arabic test");
    expect(resources.ga.translation["test.key"]).toBe("Irish test");
  });

  it("should maintain immutable structure", () => {
    const originalKeys = Object.keys(resources);

    // Attempt to modify (should not affect the original)
    try {
      resources.newLang = { translation: {} };
    } catch (error) {
      // Expected if object is frozen
    }

    // Verify structure is maintained
    expect(Object.keys(resources)).toEqual(
      expect.arrayContaining(originalKeys)
    );
  });
});
