import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AI from "../../pages/ai";
import { useTitle, useLocalStorageState, useDebounceEffect } from "ahooks";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock ahooks
jest.mock("ahooks", () => ({
  useTitle: jest.fn(),
  useLocalStorageState: jest.fn(),
  useDebounceEffect: jest.fn(),
}));

// Mock AI SDK useChat (we'll set its implementation in tests)
jest.mock("@ai-sdk/react", () => ({
  useChat: jest.fn(),
}));

// Mock 'ai' transport to avoid requiring web streams in Jest
jest.mock("ai", () => ({
  DefaultChatTransport: function (opts) {
    return { api: opts?.api };
  },
}));

// Mock ai-elements components to simplify UI interactions
jest.mock("../../components/ai-elements/conversation", () => {
  const React = require("react");
  return {
    Conversation: ({ children }) =>
      React.createElement("div", { "data-testid": "conversation" }, children),
    ConversationContent: ({ children }) =>
      React.createElement(
        "div",
        { "data-testid": "conversation-content" },
        children,
      ),
  };
});

jest.mock("../../components/ai-elements/message", () => {
  const React = require("react");
  return {
    Message: ({ children, role }) =>
      React.createElement(
        "div",
        { "data-testid": `message-${role}` },
        children,
      ),
    MessageContent: ({ children }) =>
      React.createElement(
        "div",
        { "data-testid": "message-content" },
        children,
      ),
  };
});

jest.mock("../../components/ai-elements/response", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children }) =>
      React.createElement("div", { "data-testid": "response" }, children),
  };
});

jest.mock("../../components/ai-elements/tts-button", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ text }) =>
      React.createElement(
        "button",
        { "data-testid": "tts-button" },
        text ? "Speak" : "",
      ),
  };
});

jest.mock("../../components/ai-elements/prompt-input", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ value, onChange, onSubmit, onStop, onToggleSettings }) =>
      React.createElement(
        "div",
        { "data-testid": "prompt-input" },
        React.createElement("input", {
          "data-testid": "prompt-field",
          value: value || "",
          onChange: (e) => onChange && onChange(e.target.value),
        }),
        // For test stability, clicking submit also ensures onChange is invoked with latest value
        React.createElement(
          "button",
          {
            "data-testid": "submit-btn",
            onClick: () => {
              try {
                onChange && onChange(value || "");
              } catch {}
              onSubmit && onSubmit();
            },
          },
          "Submit",
        ),
        React.createElement(
          "button",
          { "data-testid": "stop-btn", onClick: () => onStop && onStop() },
          "Stop",
        ),
        // Settings toggle button inside PromptInput toolbar
        React.createElement(
          "button",
          {
            "data-testid": "settings-btn",
            onClick: () => onToggleSettings && onToggleSettings(),
            "aria-label": "ai.settings",
          },
          "ai.settings",
        ),
      ),
  };
});

jest.mock("../../components/ai-elements/settings-panel", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ settings }) =>
      React.createElement(
        "div",
        { "data-testid": "settings-panel" },
        JSON.stringify(settings || {}),
      ),
  };
});

// Utilities
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe("AI Page Component (v5)", () => {
  const setSettings = jest.fn();
  const setSavedMessages = jest.fn();
  const mockSendMessage = jest.fn();
  const mockStop = jest.fn();
  const mockClearError = jest.fn();
  const { useChat } = require("@ai-sdk/react");

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks for storage (stable across re-renders)
    useLocalStorageState.mockReset().mockImplementation((key, opts) => {
      if (key === "ai:settings") {
        return [
          { model: "gpt-4o-mini", temperature: 1, trackSpeed: 300 },
          setSettings,
        ];
      }
      if (key === "ai:conversations") {
        return [[], setSavedMessages];
      }
      return [undefined, jest.fn()];
    });

    // Debounce effect runs immediately for tests
    useDebounceEffect.mockImplementation((fn) => {
      try {
        fn?.();
      } catch {}
    });

    // Default useChat implementation
    useChat.mockImplementation((options) => {
      // Return stubbed chat state
      return {
        id: options?.id || "ai-page",
        messages: options?.messages || [],
        sendMessage: mockSendMessage,
        stop: mockStop,
        status: "idle",
        clearError: mockClearError,
      };
    });
  });

  it("should render main container and basic structure", () => {
    render(<AI />);
    expect(screen.getByTestId("ai-container")).toBeInTheDocument();
    // Settings button is rendered inside PromptInput toolbar
    expect(
      screen.getByRole("button", { name: "ai.settings" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("conversation")).toBeInTheDocument();
    expect(screen.getByTestId("prompt-input")).toBeInTheDocument();
  });

  it("should set page title using useTitle hook", () => {
    render(<AI />);
    expect(useTitle).toHaveBeenCalledWith("header.ai");
  });

  it("should initialize local storage states for settings and conversations", () => {
    render(<AI />);
    expect(useLocalStorageState).toHaveBeenNthCalledWith(1, "ai:settings", {
      defaultValue: {
        model: "gpt-4o-mini",
        temperature: 1,
        trackSpeed: 300,
        ttsVoice: "alloy",
      },
    });
    expect(useLocalStorageState).toHaveBeenNthCalledWith(
      2,
      "ai:conversations",
      {
        defaultValue: [],
      },
    );
  });

  it("should toggle settings panel when settings button is clicked", () => {
    render(<AI />);
    const btn = screen.getByRole("button", { name: "ai.settings" });
    expect(screen.queryByTestId("settings-panel")).not.toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.getByTestId("settings-panel")).toBeInTheDocument();
  });

  it("should pass correct options to useChat (transport, id, throttle)", () => {
    render(<AI />);
    const call = useChat.mock.calls[0][0];
    expect(call.id).toBe("ai-page");
    expect(call.transport).toBeDefined();
    // experimental_throttle should use settings.trackSpeed
    expect(call.experimental_throttle).toBe(300);
  });

  it("should call stop when stop button is clicked", async () => {
    render(<AI />);
    await userEvent.click(screen.getByTestId("stop-btn"));
    expect(mockStop).toHaveBeenCalledTimes(1);
  });

  it("should persist messages when useChat finishes (onFinish)", async () => {
    // Capture onFinish passed to useChat
    let capturedOnFinish;
    useChat.mockImplementation((options) => {
      capturedOnFinish = options?.onFinish;
      return {
        id: "ai-page",
        messages: [],
        sendMessage: mockSendMessage,
        stop: mockStop,
        status: "idle",
        clearError: mockClearError,
      };
    });

    render(<AI />);

    // Simulate finishing chat with final messages
    const finalMessages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "Q" }] },
      { id: "2", role: "assistant", parts: [{ type: "text", text: "A" }] },
    ];
    capturedOnFinish && capturedOnFinish({ messages: finalMessages });

    // Expect serialization persisted
    expect(setSavedMessages).toHaveBeenCalled();
    const saved =
      setSavedMessages.mock.calls[setSavedMessages.mock.calls.length - 1][0];
    expect(Array.isArray(saved)).toBe(true);
    expect(saved.length).toBe(2);
    expect(saved[0]).toHaveProperty("role");
    expect(saved[0]).toHaveProperty("content");
  });

  it("should clean legacy localStorage keys on mount", () => {
    // Seed legacy keys
    localStorage.setItem("QandA", JSON.stringify([]));
    localStorage.setItem("LastAnswer", "foo");
    localStorage.setItem("ai-model", "bar");
    localStorage.setItem("ai-temperature", "baz");
    localStorage.setItem("ai-elements/conversations", JSON.stringify([]));
    localStorage.setItem("ai-elements/settings", JSON.stringify({}));

    render(<AI />);

    expect(localStorage.getItem("QandA")).toBe(null);
    expect(localStorage.getItem("LastAnswer")).toBe(null);
    expect(localStorage.getItem("ai-model")).toBe(null);
    expect(localStorage.getItem("ai-temperature")).toBe(null);
    expect(localStorage.getItem("ai-elements/conversations")).toBe(null);
    expect(localStorage.getItem("ai-elements/settings")).toBe(null);
  });
});
