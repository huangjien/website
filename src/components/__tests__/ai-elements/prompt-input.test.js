import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import PromptInput from "../../ai-elements/prompt-input.jsx";

// Mock useAudioRecording hook
const mockStartRecording = jest.fn(() => Promise.resolve());
const mockStopRecording = jest.fn((cb) => {
  if (typeof cb === "function") cb("transcribed text");
  return Promise.resolve();
});
jest.mock("../../../hooks/useAudioRecording", () => ({
  useAudioRecording: () => ({
    startRecording: mockStartRecording,
    stopRecording: mockStopRecording,
  }),
}));

describe("PromptInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with empty value and disables send, enables mic", () => {
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    const onStop = jest.fn();
    const onToggleSettings = jest.fn();

    render(
      <PromptInput
        value=''
        onChange={onChange}
        onSubmit={onSubmit}
        onStop={onStop}
        onToggleSettings={onToggleSettings}
      />,
    );

    expect(
      screen.getByPlaceholderText("Type your message…"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Send")).toBeDisabled();
    // Clear button is not rendered when input is empty
    expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
    // Mic should be enabled when input is empty
    expect(screen.getByLabelText("Start Recording")).toBeEnabled();
    // Stop button rendered
    expect(screen.getByLabelText("Stop")).toBeInTheDocument();
    // Settings button rendered
    expect(screen.getByLabelText("Settings")).toBeInTheDocument();
  });

  it("submits on Enter without Shift and ignores Shift+Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const onChange = jest.fn();

    render(
      <PromptInput value='Hello' onChange={onChange} onSubmit={onSubmit} />,
    );

    const textarea = screen.getByPlaceholderText("Type your message…");
    await user.type(textarea, "{enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await user.type(textarea, "{shift>}{enter}{/shift}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("respects IME composition: Enter does not submit while composing", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const onChange = jest.fn();

    render(<PromptInput value='Hi' onChange={onChange} onSubmit={onSubmit} />);
    const textarea = screen.getByPlaceholderText("Type your message…");

    // Start composition and press Enter
    const { fireEvent } = require("@testing-library/react");
    fireEvent.compositionStart(textarea);
    await user.type(textarea, "{enter}");
    expect(onSubmit).not.toHaveBeenCalled();

    // End composition, then Enter should submit
    fireEvent.compositionEnd(textarea);
    await user.type(textarea, "{enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("clears input and focuses textarea when Clear is clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<PromptInput value='Hello world' onChange={onChange} />);
    const clearBtn = screen.getByLabelText("Clear input");
    expect(clearBtn).toBeEnabled();
    await user.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("toggles mic recording and applies transcribed text", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<PromptInput value='' onChange={onChange} />);

    // Start recording
    const startBtn = screen.getByLabelText("Start Recording");
    await user.click(startBtn);
    expect(mockStartRecording).toHaveBeenCalledTimes(1);

    // Stop recording -> should call stopRecording and update input via onChange
    const stopBtn = screen.getByLabelText("Stop Recording");
    await user.click(stopBtn);
    expect(mockStopRecording).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("transcribed text");
  });

  it("invokes onStop and onToggleSettings handlers", async () => {
    const user = userEvent.setup();
    const onStop = jest.fn();
    const onToggleSettings = jest.fn();

    render(
      <PromptInput
        value=''
        onStop={onStop}
        onToggleSettings={onToggleSettings}
      />,
    );

    await user.click(screen.getByLabelText("Stop"));
    expect(onStop).toHaveBeenCalledTimes(1);

    await user.click(screen.getByLabelText("Settings"));
    expect(onToggleSettings).toHaveBeenCalledTimes(1);
  });
});
