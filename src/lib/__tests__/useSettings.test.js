import { renderHook, act, render, waitFor } from "@testing-library/react";
import { useSettings, ProvideSettings } from "../useSettings";
import React from "react";

// Mock ahooks
jest.mock("ahooks", () => {
  // Use a locally required React within the mock factory to avoid out-of-scope variable access
  const mockReact = require("react");
  return {
    useRequest: jest.fn((fn, options) => {
      // Simulate the onSuccess callback being called with proper structure
      if (options?.onSuccess) {
        setTimeout(() => {
          options.onSuccess({
            result: "theme=dark\nlanguage=en",
          });
        }, 0);
      }
      return {
        data: { result: "theme=dark\nlanguage=en" },
        loading: false,
        error: null,
      };
    }),
    useSessionStorageState: jest.fn((key, options) => {
      const defaultValue = options?.defaultValue;
      const [state, setState] = mockReact.useState(defaultValue);
      return [state, setState];
    }),
  };
});

// Mock fetch
global.fetch = jest.fn();

// Mock the properties2Json function
jest.mock("../Requests", () => ({
  properties2Json: jest.fn((data) => [
    { key: 0, name: "theme", value: "dark" },
    { key: 1, name: "language", value: "en" },
  ]),
}));

describe("useSettings hook", () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      json: () => Promise.resolve("mock settings"),
      text: () => Promise.resolve("mock settings"),
    });
  });

  const wrapper = ({ children }) => (
    <ProvideSettings>{children}</ProvideSettings>
  );

  it("should provide default settings values", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current).toHaveProperty("languageCode");
    expect(result.current).toHaveProperty("speakerName");
    expect(result.current).toHaveProperty("currentLanguage");
    expect(result.current).toHaveProperty("currentTheme");
    expect(result.current).toHaveProperty("getSetting");
    expect(result.current).toHaveProperty("setLanguageCode");
    expect(result.current).toHaveProperty("setSpeakerName");
    expect(result.current).toHaveProperty("setCurrentLanguage");
    expect(result.current).toHaveProperty("setCurrentTheme");
  });

  it("should have correct default values", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.languageCode).toBe("en-US");
    expect(result.current.speakerName).toBe("en-US-Standard-A");
    expect(result.current.currentLanguage).toBe("en");
    expect(result.current.currentTheme).toBe("light");
  });

  it("should update languageCode when setLanguageCode is called", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.setLanguageCode("fr-FR");
    });

    expect(result.current.languageCode).toBe("fr-FR");
  });

  it("should update speakerName when setSpeakerName is called", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.setSpeakerName("fr-FR-Standard-A");
    });

    expect(result.current.speakerName).toBe("fr-FR-Standard-A");
  });

  it("should update currentLanguage when setCurrentLanguage is called", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.setCurrentLanguage("fr");
    });

    expect(result.current.currentLanguage).toBe("fr");
  });

  it("should update currentTheme when setCurrentTheme is called", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.setCurrentTheme("dark");
    });

    expect(result.current.currentTheme).toBe("dark");
  });

  it("should provide getSetting function that returns setting value", async () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <ProvideSettings>{children}</ProvideSettings>,
    });

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(result.current.getSetting("theme")).toBe("dark");
    });
  });

  it("should return undefined for non-existent setting", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    const nonExistentValue = result.current.getSetting("nonexistent");
    expect(nonExistentValue).toBeUndefined();
  });

  it("should handle empty settings gracefully", () => {
    // Mock empty settings
    const { properties2Json } = require("../Requests");
    properties2Json.mockReturnValueOnce([]);

    const { result } = renderHook(() => useSettings(), { wrapper });

    const value = result.current.getSetting("theme");
    expect(value).toBeUndefined();
  });
});

describe("ProvideSettings component", () => {
  it("should render children", () => {
    const TestChild = () => <div data-testid='test-child'>Test Child</div>;

    const { getByTestId } = render(
      <ProvideSettings>
        <TestChild />
      </ProvideSettings>
    );

    expect(getByTestId("test-child")).toBeInTheDocument();
  });

  it("should provide settings context to children", () => {
    const TestChild = () => {
      const settings = useSettings();
      return (
        <div data-testid='test-child'>Language: {settings.currentLanguage}</div>
      );
    };

    const { getByTestId } = render(
      <ProvideSettings>
        <TestChild />
      </ProvideSettings>
    );

    expect(getByTestId("test-child")).toHaveTextContent("Language: en");
  });
});
