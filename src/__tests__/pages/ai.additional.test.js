import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AI from "../../pages/ai";

// Mock i18n
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

// Mock ahooks
jest.mock("ahooks", () => ({
  useTitle: jest.fn(),
  useLocalStorageState: jest.fn().mockImplementation((key, opts) => {
    if (key === "ai:settings") {
      return [
        { model: "gpt-4o-mini", temperature: 1, trackSpeed: 300, ttsVoice: "alloy" },
        jest.fn(),
      ];
    }
    if (key === "ai:conversations") {
      return [[], jest.fn()];
    }
    return [undefined, jest.fn()];
  }),
  useDebounceEffect: jest.fn((fn) => {
    try { fn?.(); } catch {}
  }),
}));

// Mock AI SDK useChat
const mockSendMessage = jest.fn();
jest.mock("@ai-sdk/react", () => ({
  useChat: jest.fn().mockImplementation((options) => ({
    id: options?.id || "ai-page",
    messages: options?.messages || [],
    sendMessage: mockSendMessage,
    stop: jest.fn(),
    status: "idle",
    clearError: jest.fn(),
  })),
}));

// Mock transport
jest.mock("ai", () => ({
  DefaultChatTransport: function (opts) { return { api: opts?.api }; },
}));

// Mock child components used by AI page for stable selectors
jest.mock("../../components/ai-elements/conversation", () => {
  const React = require("react");
  return {
    Conversation: ({ children }) => React.createElement("div", { "data-testid": "conversation" }, children),
    ConversationContent: ({ children }) => React.createElement("div", { "data-testid": "conversation-content" }, children),
  };
});

jest.mock("../../components/ai-elements/message", () => {
  const React = require("react");
  return {
    Message: ({ children, role }) => React.createElement("div", { "data-testid": `message-${role}` }, children),
    MessageContent: ({ children }) => React.createElement("div", { "data-testid": "message-content" }, children),
  };
});

jest.mock("../../components/ai-elements/response", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid='response'>{children}</div>,
}));

jest.mock("../../components/ai-elements/copy-button", () => ({
  __esModule: true,
  default: ({ text }) => <button data-testid='copy-button'>{text ? "Copy" : ""}</button>,
}));

jest.mock("../../components/ai-elements/tts-button", () => ({
  __esModule: true,
  default: ({ text, voice }) => (
    <button data-testid='tts-button' data-voice={voice || ""}>{text ? "Speak" : ""}</button>
  ),
}));

jest.mock("../../components/ai-elements/settings-panel", () => ({
  __esModule: true,
  default: ({ settings }) => <div data-testid='settings-panel'>{settings ? "Settings" : ""}</div>,
}));

jest.mock("../../components/ai-elements/prompt-input", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ value, onChange, onSubmit, onStop, onToggleSettings }) => (
      <div data-testid='prompt-input'>
        <input
          data-testid='prompt-field'
          value={value || ""}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
        <button data-testid='submit-btn' onClick={() => onSubmit && onSubmit()}>Submit</button>
        <button data-testid='stop-btn' onClick={() => onStop && onStop()}>Stop</button>
        <button aria-label='ai.settings' onClick={() => onToggleSettings && onToggleSettings()}>ai.settings</button>
      </div>
    ),
  };
});

describe("AI Page additional coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders assistant message with Response, Copy and TTS buttons", () => {
    const { useChat } = require("@ai-sdk/react");
    useChat.mockImplementation((options) => ({
      id: "ai-page",
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "Hi" }] },
        { id: "2", role: "assistant", parts: [{ type: "text", text: "Hello" }] },
      ],
      sendMessage: mockSendMessage,
      stop: jest.fn(),
      status: "idle",
      clearError: jest.fn(),
    }));

    render(<AI />);
    expect(screen.getByTestId("message-user")).toBeInTheDocument();
    expect(screen.getByTestId("message-assistant")).toBeInTheDocument();
    expect(screen.getByTestId("response")).toBeInTheDocument();
    expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    expect(screen.getByTestId("tts-button")).toBeInTheDocument();
  });

  it("does not send when prompt is empty or whitespace", async () => {
    const user = userEvent.setup();
    render(<AI />);
    await user.click(screen.getByTestId("submit-btn"));
    expect(mockSendMessage).not.toHaveBeenCalled();
    // whitespace only
    const input = screen.getByTestId("prompt-field");
    await user.type(input, "   ");
    await user.click(screen.getByTestId("submit-btn"));
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("sends a user message with parts and clears prompt", async () => {
    const user = userEvent.setup();
    render(<AI />);
    const input = screen.getByTestId("prompt-field");
    await user.type(input, "What is AI?");
    await user.click(screen.getByTestId("submit-btn"));
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    const payload = mockSendMessage.mock.calls[0][0];
    expect(payload).toMatchObject({ role: "user" });
    expect(Array.isArray(payload.parts)).toBe(true);
    expect(payload.parts[0]).toMatchObject({ type: "text" });
    // Prompt should be cleared
    expect(screen.getByTestId("prompt-field")).toHaveValue("");
  });

  it("uses uiMessageText fallbacks for content and text fields", () => {
    const { useChat } = require("@ai-sdk/react");
    useChat.mockImplementation(() => ({
      id: "ai-page",
      messages: [
        { id: "a1", role: "assistant", content: "Assistant via content" },
        { id: "u1", role: "user", text: "User via text" },
      ],
      sendMessage: mockSendMessage,
      stop: jest.fn(),
      status: "idle",
      clearError: jest.fn(),
    }));

    render(<AI />);
    expect(screen.getByTestId("message-assistant")).toHaveTextContent("Assistant via content");
    expect(screen.getByTestId("message-user")).toHaveTextContent("User via text");
  });

  it("toggles settings panel and covers default tts voice and undefined throttle", async () => {
    const { useChat } = require("@ai-sdk/react");
    // Ensure useChat respects options.messages (hydrated from savedMessages)
    useChat.mockImplementation((options) => ({
      id: options?.id || "ai-page",
      messages: options?.messages || [],
      sendMessage: jest.fn(),
      stop: jest.fn(),
      status: "idle",
      clearError: jest.fn(),
    }));
    const serialized = [
      { id: "s1", role: "assistant", content: "Persisted answer", timestamp: Math.round(Date.now()/1000) },
    ];
    const { useLocalStorageState } = require("ahooks");
    // For this test only, override local storage hooks to provide custom settings and messages
    useLocalStorageState
      .mockImplementationOnce((key) => {
        if (key === "ai:settings") return [{ model: "test-model", temperature: 1 }, jest.fn()];
        return [undefined, jest.fn()];
      })
      .mockImplementationOnce((key) => {
        if (key === "ai:conversations") return [serialized, jest.fn()];
        return [undefined, jest.fn()];
      });

    const user = userEvent.setup();
    render(<AI />);
    // Assistant message rendered from hydrated savedMessages
    expect(screen.getByTestId("message-assistant")).toHaveTextContent("Persisted answer");
    // Toggle settings panel
    await user.click(screen.getByLabelText("ai.settings"));
    expect(screen.getByTestId("settings-panel")).toBeInTheDocument();
  });

  it("handles alternative message parts (image/audio) and still shows Copy/TTS buttons", () => {
    const { useChat } = require("@ai-sdk/react");
    useChat.mockImplementation(() => ({
      id: "ai-page",
      messages: [
        {
          id: "a2",
          role: "assistant",
          parts: [
            { type: "image", url: "http://example.com/img.png" },
            { type: "audio", url: "http://example.com/a.mp3" },
          ],
        },
      ],
      sendMessage: mockSendMessage,
      stop: jest.fn(),
      status: "idle",
      clearError: jest.fn(),
    }));

    render(<AI />);
    // uiMessageText should produce empty string for non-text parts
    expect(screen.getByTestId("response")).toHaveTextContent("");
    // Buttons are present even if text is empty
    expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    expect(screen.getByTestId("tts-button")).toBeInTheDocument();
  });

  it("renders Copy/TTS when assistant text is empty (edge state)", () => {
    const { useChat } = require("@ai-sdk/react");
    useChat.mockImplementation(() => ({
      id: "ai-page",
      messages: [
        { id: "a3", role: "assistant", parts: [{ type: "text", text: "" }] },
      ],
      sendMessage: mockSendMessage,
      stop: jest.fn(),
      status: "idle",
      clearError: jest.fn(),
    }));

    render(<AI />);
    // No visible text, but controls still render
    expect(screen.getByTestId("response")).toHaveTextContent("");
    expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    expect(screen.getByTestId("tts-button")).toBeInTheDocument();
  });

  it("passes fallback voice 'alloy' when settings.ttsVoice is undefined, and passes custom voice otherwise", () => {
    const { useChat } = require("@ai-sdk/react");
    useChat.mockImplementation((options) => ({
      id: options?.id || "ai-page",
      messages: [
        { id: "a4", role: "assistant", parts: [{ type: "text", text: "Hello" }] },
      ],
      sendMessage: mockSendMessage,
      stop: jest.fn(),
      status: "idle",
      clearError: jest.fn(),
    }));

    const { useLocalStorageState } = require("ahooks");
    // First call: settings without ttsVoice -> should fallback to 'alloy'
    useLocalStorageState
      .mockImplementationOnce((key) => {
        if (key === "ai:settings") return [{ model: "x", temperature: 0.5 }, jest.fn()];
        return [undefined, jest.fn()];
      })
      // Second call: conversations empty
      .mockImplementationOnce((key) => {
        if (key === "ai:conversations") return [[], jest.fn()];
        return [undefined, jest.fn()];
      });

    const { rerender } = render(<AI />);
    // TTS button should receive alloy
    expect(screen.getByTestId("tts-button").getAttribute("data-voice")).toBe("alloy");

    // Now provide a custom voice (mismatch scenario is handled downstream, AI page passes through)
    useLocalStorageState
      .mockImplementationOnce((key) => {
        if (key === "ai:settings") return [{ model: "x", temperature: 0.5, ttsVoice: "celeste" }, jest.fn()];
        return [undefined, jest.fn()];
      })
      .mockImplementationOnce((key) => {
        if (key === "ai:conversations") return [[], jest.fn()];
        return [undefined, jest.fn()];
      });

    rerender(<AI />);
    expect(screen.getByTestId("tts-button").getAttribute("data-voice")).toBe("celeste");
  });
});