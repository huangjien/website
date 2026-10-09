import { renderHook, act } from "@testing-library/react";
import { useAiSettings, DEFAULT_AI_SETTINGS } from "../useAiSettings";

describe("useAiSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the merged defaults after mount when nothing is stored", () => {
    const { result } = renderHook(() => useAiSettings());
    expect(result.current.settings).toEqual(DEFAULT_AI_SETTINGS);
    expect(result.current.settings.model).toBe("gpt-4o-mini");
    expect(result.current.mounted).toBe(true);
  });

  it("exposes stored settings after mount", () => {
    localStorage.setItem(
      "ai:settings",
      JSON.stringify({
        model: "gpt-4.1",
        temperature: 0.4,
        trackSpeed: 100,
        ttsVoice: "aria",
        systemPrompt: "be terse",
      }),
    );

    const { result } = renderHook(() => useAiSettings());

    expect(result.current.mounted).toBe(true);
    expect(result.current.settings).toEqual({
      model: "gpt-4.1",
      temperature: 0.4,
      trackSpeed: 100,
      ttsVoice: "aria",
      systemPrompt: "be terse",
    });
  });

  it("fills in defaults for missing keys in stored settings", () => {
    localStorage.setItem("ai:settings", JSON.stringify({ temperature: 0.2 }));

    const { result } = renderHook(() => useAiSettings());

    expect(result.current.settings).toEqual({
      ...DEFAULT_AI_SETTINGS,
      temperature: 0.2,
    });
  });

  it("updates settings via setSettings", () => {
    const { result } = renderHook(() => useAiSettings());

    act(() => {
      result.current.setSettings((prev) => ({ ...prev, temperature: 0.7 }));
    });

    expect(result.current.settings.temperature).toBe(0.7);
    expect(result.current.settings.model).toBe(DEFAULT_AI_SETTINGS.model);
  });

  it("persists updates to localStorage", () => {
    const { result } = renderHook(() => useAiSettings());

    act(() => {
      result.current.setSettings((prev) => ({ ...prev, model: "gpt-4o" }));
    });

    const stored = JSON.parse(localStorage.getItem("ai:settings"));
    expect(stored.model).toBe("gpt-4o");
  });

  it("returns a new settings reference when stored changes", () => {
    const { result, rerender } = renderHook(() => useAiSettings());
    const first = result.current.settings;

    act(() => {
      result.current.setSettings((prev) => ({ ...prev, ttsVoice: "verse" }));
    });

    expect(result.current.settings).not.toBe(first);
    expect(result.current.settings.ttsVoice).toBe("verse");
    rerender();
  });

  it("does not mutate the frozen DEFAULT_AI_SETTINGS", () => {
    const snapshot = { ...DEFAULT_AI_SETTINGS };
    const { result } = renderHook(() => useAiSettings());

    act(() => {
      result.current.setSettings((prev) => ({ ...prev, model: "gpt-4o" }));
    });

    expect(DEFAULT_AI_SETTINGS).toEqual(snapshot);
  });
});
