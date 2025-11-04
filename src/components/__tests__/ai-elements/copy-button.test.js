import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CopyButton from "../../ai-elements/copy-button.jsx";

// Mock Notification helpers used by the component
jest.mock("../../../components/Notification", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const { success, error } = require("../../../components/Notification");

describe("CopyButton", () => {
  beforeEach(() => {
    success.mockClear();
    error.mockClear();
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("copies text and shows success toast", async () => {
    render(<CopyButton text='Hello world' />);
    const btn = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(btn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Hello world");
    // success toast should be called
    await waitFor(() => expect(success).toHaveBeenCalled());
    expect(error).not.toHaveBeenCalled();
  });

  it("does nothing when text is empty", () => {
    render(<CopyButton text='' />);
    const btn = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(btn);
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("shows error toast when clipboard write fails", async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error("fail"));
    render(<CopyButton text='Oops' />);
    const btn = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(btn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Oops");
    await waitFor(() => expect(error).toHaveBeenCalled());
  });
});
