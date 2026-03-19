let languageChangedHandler;
let mockAddResourceBundle;
let mockOn;
let mockUse;
let mockInit;
let ensureLocaleLoaded;
let i18n;

jest.mock("i18next", () => {
  mockAddResourceBundle = jest.fn();
  mockOn = jest.fn((event, handler) => {
    if (event === "languageChanged") {
      languageChangedHandler = handler;
    }
  });
  mockInit = jest.fn();
  const instance = {
    addResourceBundle: mockAddResourceBundle,
    on: mockOn,
    init: (...args) => mockInit(...args),
  };
  mockUse = jest.fn(() => instance);
  return {
    __esModule: true,
    default: instance,
    use: mockUse,
  };
});

jest.mock("react-i18next", () => ({
  initReactI18next: {},
}));

const mockFrLoader = jest.fn(async () => ({ default: { hello: "bonjour" } }));
const mockRawLoader = jest.fn(async () => ({ hi: "there" }));
const mockDeLoader = jest.fn(async () => ({ default: { hello: "hallo" } }));

jest.mock("../resources", () => ({
  resources: { en: { translation: { hello: "hello" } } },
  localeLoaders: {
    de: () => mockDeLoader(),
    fr: () => mockFrLoader(),
    raw: () => mockRawLoader(),
  },
}));

beforeAll(() => {
  const i18nModule = require("../i18n");
  i18n = i18nModule.default;
  ensureLocaleLoaded = i18nModule.ensureLocaleLoaded;
});

describe("i18n ensureLocaleLoaded", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInit.mockReturnValue(i18n);
  });

  it("initializes i18n and registers languageChanged handler", () => {
    expect(i18n).toBeDefined();
    expect(typeof languageChangedHandler).toBe("function");
  });

  it("loads locale bundle once and avoids duplicate loads", async () => {
    await ensureLocaleLoaded("fr");
    await ensureLocaleLoaded("fr");

    expect(mockFrLoader).toHaveBeenCalledTimes(1);
    expect(mockAddResourceBundle).toHaveBeenCalledWith(
      "fr",
      "translation",
      { hello: "bonjour" },
      true,
      true,
    );
  });

  it("returns early for empty or unknown locale", async () => {
    await ensureLocaleLoaded("");
    await ensureLocaleLoaded("unknown");

    expect(mockFrLoader).not.toHaveBeenCalled();
    expect(mockRawLoader).not.toHaveBeenCalled();
    expect(mockAddResourceBundle).not.toHaveBeenCalled();
  });

  it("handles loader payload without default export", async () => {
    await ensureLocaleLoaded("raw");
    expect(mockRawLoader).toHaveBeenCalledTimes(1);
    expect(mockAddResourceBundle).toHaveBeenCalledWith(
      "raw",
      "translation",
      { hello: "hello", hi: "there" },
      true,
      true,
    );
  });

  it("loads locale when languageChanged event fires", async () => {
    await languageChangedHandler("de");
    expect(mockDeLoader).toHaveBeenCalledTimes(1);
  });
});
