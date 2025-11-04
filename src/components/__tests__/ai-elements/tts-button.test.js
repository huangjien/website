import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock next-auth session as authenticated so the button renders
jest.mock("next-auth/react", () => ({
  useSession: () => ({ status: "authenticated" }),
}));
import TTSButton from "../../ai-elements/tts-button.jsx";

jest.mock("../../../components/Notification", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));
const { error } = require("../../../components/Notification");

describe("TTSButton", () => {
  let originalFetch;
  let originalAudio;
  let originalCreateObjectURL;
  let originalRevokeObjectURL;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalAudio = global.Audio;
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;

    error.mockClear();

    // Mock fetch
    global.fetch = jest.fn();

    // Mock URL APIs
    URL.createObjectURL = jest.fn(() => "blob:mock");
    URL.revokeObjectURL = jest.fn();

    // Mock Audio
    global.Audio = jest.fn(() => ({
      play: jest.fn(),
      addEventListener: jest.fn((evt, cb) => {
        if (evt === "ended") {
          // Optionally trigger ended callback later if needed
        }
      }),
    }));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.Audio = originalAudio;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it("calls /api/tts and plays audio when response is ok", async () => {
    const blob = new Blob(["audio"], { type: "audio/mpeg" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(blob),
    });

    render(<TTSButton text='Hello' voice='alloy' />);
    const btn = screen.getByRole("button", { name: /play/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(global.Audio).toHaveBeenCalled();
    });

    expect(URL.createObjectURL).toHaveBeenCalled();
    // No error toast expected
    expect(error).not.toHaveBeenCalled();
  });

  it("does not toast error on 401 responses", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401 });

    render(<TTSButton text='Hello' />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    expect(error).not.toHaveBeenCalled();
  });

  it("shows error toast when non-401 response fails", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    render(<TTSButton text='Hello' />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    expect(error).toHaveBeenCalled();
  });

  it("shows error toast on fetch exception", async () => {
    global.fetch.mockRejectedValueOnce(new Error("network"));
    render(<TTSButton text='Hello' />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(error).toHaveBeenCalled();
    });
  });
});
