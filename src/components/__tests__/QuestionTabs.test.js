import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionTabs } from "../QuestionTabs";
import { success, error } from "../Notification";
import { getAnswer } from "../../lib/aiService";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (options?.defaultValue) {
        return options.defaultValue;
      }
      const translations = {
        "ai.text_input": "Text Input",
        "ai.audio_input": "Audio Input",
        "ai.enter_question": "Enter your question here...",
        "ai.start_recording": "Start Recording",
        "ai.stop_recording": "Stop Recording",
        "ai.recording_error": "Recording error occurred",
        "ai.recording_not_supported": "Recording not supported",
        "ai.return_error": "Return error",
        "ai.error": "An error occurred",
        "ai.audio_question": "Audio Question",
        "ai.return_length": "Response length",
        "ai.input_placeholder": "Enter your question here...",
        "ai.send_tooltip": "Send message",
        "ai.hold": "Hold to record",
        "ai.conversation": "Conversation",
        "ai.configuration": "Configuration",
        "ai.select_model": "Select model",
        "ai.temperature": "Temperature",
        "ai.value_range_0_1": "Value range 0~1",
        "ai.track_speed": "Track speed",
        "ai.value_range_50_500": "Value range 50~500",
        "ai.send": "Send",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock Notifications
jest.mock("../Notification", () => ({
  success: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock AI service
jest.mock("../../lib/aiService", () => ({
  getAnswer: jest.fn(),
}));

// Mock useSettings to avoid context dependencies inside ConfigurationTab
jest.mock("../../lib/useSettings", () => ({
  useSettings: () => ({
    getSetting: jest.fn(() => undefined),
  }),
}));

describe("QuestionTabs (Radix/Shadcn)", () => {
  const mockAppend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders tabs with Conversation and Configuration options", () => {
    render(<QuestionTabs append={mockAppend} />);

    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByText("Conversation")).toBeInTheDocument();
    expect(screen.getByText("Configuration")).toBeInTheDocument();

    // Tab triggers should be accessible
    const conversationTrigger = screen.getByRole("tab", {
      name: /Conversation/i,
    });
    const configurationTrigger = screen.getByRole("tab", {
      name: /Configuration/i,
    });
    expect(conversationTrigger).toBeInTheDocument();
    expect(configurationTrigger).toBeInTheDocument();
  });

  it("renders textarea and send button by default in Conversation tab", () => {
    render(<QuestionTabs append={mockAppend} />);

    expect(screen.getByTestId("textarea")).toBeInTheDocument();
    expect(screen.getByLabelText("Send")).toBeInTheDocument();
  });

  it("handles text input change", async () => {
    const user = userEvent.setup();
    render(<QuestionTabs append={mockAppend} />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "What is AI?");
    expect(textarea).toHaveValue("What is AI?");
  });

  it("submits text question and appends result", async () => {
    const user = userEvent.setup();

    getAnswer.mockResolvedValueOnce({
      choices: [{ message: { content: "AI is artificial intelligence" } }],
      id: "test-id",
      created: 1234567890,
      model: "gpt-4.1-mini",
      usage: {
        prompt_tokens: 5,
        completion_tokens: 10,
        total_tokens: 15,
      },
    });

    render(<QuestionTabs append={mockAppend} />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "What is AI?");
    await user.click(screen.getByLabelText("Send"));

    await waitFor(() => {
      expect(getAnswer).toHaveBeenCalledWith(
        "What is AI?",
        "",
        "gpt-4.1-mini",
        0.5,
      );
    });

    await waitFor(() => {
      expect(mockAppend).toHaveBeenCalledWith({
        question: "What is AI?",
        answer: "AI is artificial intelligence",
        key: "test-id",
        id: "test-id",
        temperature: 0.5,
        timestamp: 1234567890,
        model: "gpt-4.1-mini",
        question_tokens: 5,
        answer_tokens: 10,
        total_tokens: 15,
      });
    });
  });

  it("shows success message after successful submission", async () => {
    const user = userEvent.setup();

    getAnswer.mockResolvedValueOnce({
      choices: [{ message: { content: "AI is artificial intelligence" } }],
      id: "test-id",
      created: 1234567890,
      model: "gpt-4.1-mini",
      usage: {
        prompt_tokens: 5,
        completion_tokens: 10,
        total_tokens: 15,
      },
    });

    render(<QuestionTabs append={mockAppend} />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "Test question that is long enough");
    await user.click(screen.getByLabelText("Send"));

    await waitFor(() => {
      expect(mockAppend).toHaveBeenCalled();
    });

    expect(success).toHaveBeenCalledWith("Response length: 10");
    expect(error).not.toHaveBeenCalled();
  });

  it("does not disable submit button when text is empty", () => {
    render(<QuestionTabs append={mockAppend} />);
    const submitButton = screen.getByLabelText("Send");
    expect(submitButton).not.toBeDisabled();
  });

  it("shows loading state (progress + disabled controls) during submission", async () => {
    const user = userEvent.setup();
    let resolvePromise;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    getAnswer.mockReturnValue(mockPromise);

    render(<QuestionTabs append={mockAppend} />);

    const textarea = screen.getByTestId("textarea");
    const submitButton = screen.getByLabelText("Send");

    await user.type(textarea, "Test question");
    await user.click(submitButton);

    // Progress should appear and controls should be disabled while loading
    await waitFor(() => {
      expect(screen.getByTestId("progress")).toBeInTheDocument();
      expect(textarea).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    // Resolve the promise
    resolvePromise({
      choices: [{ message: { content: "Test response" } }],
      id: "test-id",
      created: 1234567890,
      model: "gpt-4.1-mini",
      usage: {
        prompt_tokens: 5,
        completion_tokens: 10,
        total_tokens: 15,
      },
    });

    // After resolution, progress disappears and controls are enabled
    await waitFor(() => {
      expect(screen.queryByTestId("progress")).not.toBeInTheDocument();
      expect(textarea).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("switches to Configuration tab and shows configuration controls", async () => {
    const user = userEvent.setup();
    render(<QuestionTabs append={mockAppend} />);

    const conversationTrigger = screen.getByRole("tab", {
      name: /Conversation/i,
    });
    const configurationTrigger = screen.getByRole("tab", {
      name: /Configuration/i,
    });

    // Click configuration tab
    await user.click(configurationTrigger);

    // Active/inactive states
    expect(configurationTrigger).toHaveAttribute("data-state", "active");
    expect(conversationTrigger).toHaveAttribute("data-state", "inactive");

    // Configuration UI should be present
    expect(screen.getByTestId("select-label")).toHaveTextContent(
      "Select model",
    );
    const select = screen.getByTestId("select");
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("gpt-4.1-mini");

    const temperatureInput = screen.getByPlaceholderText("Value range 0~1");
    expect(temperatureInput).toBeInTheDocument();
    expect(temperatureInput).toHaveValue(0.5);

    const trackSpeedInput = screen.getByPlaceholderText("Value range 50~500");
    expect(trackSpeedInput).toBeInTheDocument();
    expect(trackSpeedInput).toHaveValue(300);
  });

  it("handles API error gracefully and shows error notification", async () => {
    const user = userEvent.setup();

    getAnswer.mockResolvedValueOnce({
      error: {
        code: "api_error",
        message: "API Error occurred",
      },
    });

    render(<QuestionTabs append={mockAppend} />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "Test question that is long enough");
    await user.click(screen.getByLabelText("Send"));

    await waitFor(() => {
      // Error is invoked with a message containing the translated "Return error"
      expect(
        error.mock.calls.some(
          (call) =>
            typeof call[0] === "string" && call[0].includes("Return error"),
        ),
      ).toBe(true);
    });
  });

  it("clears text input after successful submission", async () => {
    const user = userEvent.setup();

    getAnswer.mockResolvedValueOnce({
      choices: [{ message: { content: "Test answer" } }],
      id: "test-id",
      created: 1234567890,
      model: "gpt-4.1-mini",
      usage: {
        prompt_tokens: 5,
        completion_tokens: 10,
        total_tokens: 15,
      },
    });

    render(<QuestionTabs append={mockAppend} />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "Test question that is long enough");
    expect(textarea).toHaveValue("Test question that is long enough");

    await user.click(screen.getByLabelText("Send"));

    await waitFor(() => {
      expect(mockAppend).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });

  it("renders textarea with correct placeholder", () => {
    render(<QuestionTabs append={mockAppend} />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute(
      "placeholder",
      "Enter your question here...",
    );
  });
});
