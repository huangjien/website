// Global test setup file
import "@testing-library/jest-dom";

// Global mock for react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (options?.defaultValue) {
        return options.defaultValue;
      }
      return key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: "en",
    },
  }),
  initReactI18next: jest.fn(),
}));

// Mock environment variables for tests
process.env.GITHUB_REPO = "https://api.github.com/repos/test/repo";
process.env.GITHUB_TOKEN = "test-token";
process.env.GITHUB_MEMBER =
  "https://api.github.com/repos/test/repo/collaborators/testuser";
process.env.OPEN_API_KEY = "test-openai-key";
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.NEXTAUTH_URL = "http://localhost:3000";

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning:") ||
        args[0].includes("ReactDOM.render") ||
        args[0].includes("act()"))
    ) {
      return;
    }
    // Suppress jsdom navigation errors
    if (
      args[0] &&
      args[0].type === "not implemented" &&
      args[0].message &&
      args[0].message.includes("navigation")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Warning:")) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Set up before each test
beforeEach(() => {
  // Mock window.location
  originalLocation = window.location;
  delete window.location;
  window.location = {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  };
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();

  // Clean up any DOM changes
  document.body.innerHTML = "";

  // Clean up any timers
  jest.clearAllTimers();

  // Restore window.location
  if (originalLocation) {
    window.location = originalLocation;
  }
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.location - will be set up in beforeEach
let originalLocation;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.URL.revokeObjectURL = jest.fn();

// Mock fetch if not already mocked
if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
      blob: () => Promise.resolve(new Blob()),
    })
  );
}
