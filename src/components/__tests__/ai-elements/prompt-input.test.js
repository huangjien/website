import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PromptInput from "../../ai-elements/prompt-input.jsx";

// Mock useAudioRecording to avoid real media interactions
jest.mock("../../../hooks/useAudioRecording", () => ({
  useAudioRecording: () => ({
    startRecording: jest.fn().mockResolvedValue(undefined),
    stopRecording: jest.fn((onTranscribe) => {
      if (typeof onTranscribe === "function") {
        onTranscribe("transcribed text");
      }
      return Promise.resolve();
    }),
  }),
}));

describe("PromptInput", () => {
  it("submits on Enter without Shift when input has content", () => {
    const onSubmit = jest.fn();
    const onChange = jest.fn();
    render(
      <PromptInput value={"Hello"} onSubmit={onSubmit} onChange={onChange} />
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onSubmit).toHaveBeenCalled();
  });

  it("does not submit on Shift+Enter", () => {
    const onSubmit = jest.fn();
    render(<PromptInput value={"Hello"} onSubmit={onSubmit} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("clears input via clear button", () => {
    const onChange = jest.fn();
    render(<PromptInput value={"Hello"} onChange={onChange} />);
    // i18n may render key as accessible name; be flexible
    const clearBtn = screen.getByRole("button", {
      name: /ai\.clear_input|clear input/i,
    });
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith("");
  });
});
