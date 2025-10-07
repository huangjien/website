import "@testing-library/jest-dom";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.getComputedStyle
Object.defineProperty(window, "getComputedStyle", {
  value: () => ({
    getPropertyValue: () => "",
  }),
});

// Mock HTMLElement.prototype.scrollIntoView
HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock document.elementFromPoint
document.elementFromPoint = jest.fn();

// Mock createPortal for modals
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (node) => node,
}));
