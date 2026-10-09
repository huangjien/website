import { renderHook, act } from "@testing-library/react";
import {
  useAiThread,
  AI_THREAD_KEY,
  THREAD_DEBOUNCE_MS,
  THREAD_RETENTION_DAYS,
  THREAD_SOFT_CAP,
} from "../useAiThread";

describe("useAiThread", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useRealTimers();
  });

  it("returns an empty thread and mounted=true after mount when nothing is stored", () => {
    const { result } = renderHook(() => useAiThread());
    expect(result.current.thread).toEqual([]);
    expect(result.current.mounted).toBe(true);
  });

  it("loads the stored thread after mount", () => {
    const stored = [
      { id: "1", role: "user", content: "hi", timestamp: 1_700_000_000 },
      {
        id: "2",
        role: "assistant",
        content: "hello",
        timestamp: 1_700_000_010,
      },
    ];
    localStorage.setItem(AI_THREAD_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useAiThread());

    expect(result.current.thread).toEqual(stored);
  });

  it("persists messages after the debounce window elapses", () => {
    jest.useFakeTimers();
    const messages = [
      {
        id: "1",
        role: "user",
        parts: [{ type: "text", text: "hi" }],
      },
    ];

    const { result } = renderHook(() => useAiThread({ messages }));

    // Initial render: localStorage hasn't been touched yet
    expect(localStorage.getItem(AI_THREAD_KEY)).toBeNull();

    act(() => {
      jest.advanceTimersByTime(THREAD_DEBOUNCE_MS + 50);
    });

    const stored = JSON.parse(localStorage.getItem(AI_THREAD_KEY));
    expect(Array.isArray(stored)).toBe(true);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ id: "1", role: "user", content: "hi" });
    expect(result.current.thread).toEqual(stored);
  });

  it("skips persistence while status is 'streaming' or 'submitted'", () => {
    jest.useFakeTimers();
    const messages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "hi" }] },
    ];

    renderHook(() => useAiThread({ messages, status: "streaming" }));

    act(() => {
      jest.advanceTimersByTime(THREAD_DEBOUNCE_MS + 50);
    });

    expect(localStorage.getItem(AI_THREAD_KEY)).toBeNull();
  });

  it("persists when status transitions back to 'ready'", () => {
    jest.useFakeTimers();
    const messages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "hi" }] },
    ];

    const { rerender } = renderHook(
      ({ status }) => useAiThread({ messages, status }),
      { initialProps: { status: "streaming" } },
    );

    act(() => {
      jest.advanceTimersByTime(THREAD_DEBOUNCE_MS + 50);
    });
    expect(localStorage.getItem(AI_THREAD_KEY)).toBeNull();

    rerender({ status: "ready" });

    act(() => {
      jest.advanceTimersByTime(THREAD_DEBOUNCE_MS + 50);
    });

    const stored = JSON.parse(localStorage.getItem(AI_THREAD_KEY));
    expect(stored).toHaveLength(1);
  });

  it("does not write when the tail hasn't changed (no-op suppression)", () => {
    jest.useFakeTimers();
    const messages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "hi" }] },
    ];

    const { rerender } = renderHook(
      ({ msgs }) => useAiThread({ messages: msgs, status: "ready" }),
      { initialProps: { msgs: messages } },
    );

    act(() => {
      jest.advanceTimersByTime(THREAD_DEBOUNCE_MS + 50);
    });
    const first = JSON.parse(localStorage.getItem(AI_THREAD_KEY));

    // Same tail — should not overwrite
    rerender({ msgs: [{ ...messages[0] }] });

    act(() => {
      jest.advanceTimersByTime(THREAD_DEBOUNCE_MS + 50);
    });
    const second = JSON.parse(localStorage.getItem(AI_THREAD_KEY));
    expect(second).toEqual(first);
  });

  it("trims the thread when it exceeds the soft cap", () => {
    jest.useFakeTimers();

    const now = Math.floor(Date.now() / 1000);
    const oldTs = now - (THREAD_RETENTION_DAYS + 5) * 86_400; // older than retention
    const freshTs = now - 60;

    const overflowing = [];
    for (let i = 0; i < THREAD_SOFT_CAP + 5; i++) {
      overflowing.push({
        id: String(i),
        role: i % 2 === 0 ? "user" : "assistant",
        content: `msg-${i}`,
        timestamp: oldTs,
      });
    }
    // Plus one fresh entry that should survive the trim
    overflowing.push({
      id: "fresh",
      role: "user",
      content: "fresh",
      timestamp: freshTs,
    });

    localStorage.setItem(AI_THREAD_KEY, JSON.stringify(overflowing));

    renderHook(() => useAiThread({ messages: [], status: "ready" }));

    act(() => {
      jest.advanceTimersByTime(5_000 + 50);
    });

    const stored = JSON.parse(localStorage.getItem(AI_THREAD_KEY));
    // Only the fresh entry should survive
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe("fresh");
  });

  it("does not trim when under the soft cap", () => {
    jest.useFakeTimers();
    const entries = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      role: "user",
      content: `msg-${i}`,
      timestamp: Math.floor(Date.now() / 1000) - 100,
    }));
    localStorage.setItem(AI_THREAD_KEY, JSON.stringify(entries));

    // Provide messages matching the stored thread so persistence doesn't
    // overwrite the seed.
    const messages = entries.map((e) => ({
      id: e.id,
      role: e.role,
      parts: [{ type: "text", text: e.content }],
    }));

    renderHook(() => useAiThread({ messages, status: "ready" }));

    act(() => {
      jest.advanceTimersByTime(5_000 + 50);
    });

    const stored = JSON.parse(localStorage.getItem(AI_THREAD_KEY));
    expect(stored).toHaveLength(5);
  });

  it("exposes a setThread setter for migrations", () => {
    const { result } = renderHook(() => useAiThread());

    act(() => {
      result.current.setThread([
        { id: "1", role: "user", content: "x", timestamp: 1 },
      ]);
    });

    expect(result.current.thread).toEqual([
      { id: "1", role: "user", content: "x", timestamp: 1 },
    ]);
  });
});
