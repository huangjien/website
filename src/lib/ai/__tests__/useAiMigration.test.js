import { renderHook } from "@testing-library/react";
import { useAiMigration, LEGACY_KEYS } from "../useAiMigration";

describe("useAiMigration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("is a no-op when ready is false", () => {
    localStorage.setItem(
      "ai-elements/conversations",
      JSON.stringify([{ messages: [{ id: "1", role: "user", content: "q" }] }]),
    );

    const { result } = renderHook(() => useAiMigration({ ready: false }));

    expect(result.current).toBeUndefined();
    expect(localStorage.getItem("ai-elements/conversations")).not.toBeNull();
  });

  it("does nothing when the new namespace already has data", () => {
    localStorage.setItem(
      "ai-elements/conversations",
      JSON.stringify([
        { messages: [{ id: "1", role: "user", content: "old" }] },
      ]),
    );
    localStorage.setItem(
      "QandA",
      JSON.stringify([{ question: "q", answer: "a" }]),
    );

    const setThread = jest.fn();
    renderHook(() =>
      useAiMigration({
        ready: true,
        thread: [{ id: "x", role: "user", content: "already here" }],
        setThread,
      }),
    );

    expect(setThread).not.toHaveBeenCalled();
    // Legacy keys are still removed even when migration is skipped
    expect(localStorage.getItem("QandA")).toBeNull();
    expect(localStorage.getItem("ai-elements/conversations")).toBeNull();
  });

  it("migrates from ai-elements/conversations", () => {
    localStorage.setItem(
      "ai-elements/conversations",
      JSON.stringify([
        {
          messages: [
            { id: "1", role: "user", content: "first" },
            { id: "2", role: "assistant", content: "reply" },
          ],
        },
      ]),
    );

    const setThread = jest.fn();
    renderHook(() => useAiMigration({ ready: true, thread: [], setThread }));

    expect(setThread).toHaveBeenCalledTimes(1);
    const migrated = setThread.mock.calls[0][0];
    expect(migrated).toHaveLength(2);
    expect(migrated[0]).toMatchObject({ role: "user", content: "first" });
    expect(migrated[1]).toMatchObject({ role: "assistant", content: "reply" });

    // Legacy key is removed
    expect(localStorage.getItem("ai-elements/conversations")).toBeNull();
  });

  it("generates ids when missing from legacy conversations", () => {
    localStorage.setItem(
      "ai-elements/conversations",
      JSON.stringify([
        {
          messages: [{ role: "user", content: "no id" }],
        },
      ]),
    );

    const setThread = jest.fn();
    renderHook(() => useAiMigration({ ready: true, thread: [], setThread }));

    const migrated = setThread.mock.calls[0][0];
    expect(typeof migrated[0].id).toBe("string");
    expect(migrated[0].id.length).toBeGreaterThan(0);
  });

  it("falls back to QandA when ai-elements/conversations is empty", () => {
    localStorage.setItem(
      "ai-elements/conversations",
      JSON.stringify([{ messages: [] }]),
    );
    localStorage.setItem(
      "QandA",
      JSON.stringify([
        { id: "q1", question: "Q?", answer: "A!", timestamp: 1_700_000_000 },
      ]),
    );

    const setThread = jest.fn();
    renderHook(() => useAiMigration({ ready: true, thread: [], setThread }));

    expect(setThread).toHaveBeenCalledTimes(1);
    // QandA fallback passes an updater function; invoke it to recover the
    // migrated array.
    const updater = setThread.mock.calls[0][0];
    expect(typeof updater).toBe("function");
    const migrated = updater([]);
    expect(migrated).toHaveLength(2);
    expect(migrated[0]).toMatchObject({
      role: "user",
      content: "Q?",
      timestamp: 1_700_000_000,
    });
    expect(migrated[1]).toMatchObject({
      role: "assistant",
      content: "A!",
      timestamp: 1_700_000_000,
    });
  });

  it("does not overwrite an existing thread when called with a setter function", () => {
    localStorage.setItem(
      "QandA",
      JSON.stringify([{ question: "Q", answer: "A" }]),
    );

    let stored = [];
    const setThread = jest.fn((next) => {
      if (typeof next === "function") {
        stored = next(stored);
      } else {
        stored = next;
      }
    });

    // Simulate the migration running, then a later thread arriving.
    renderHook(() => useAiMigration({ ready: true, thread: [], setThread }));
    expect(stored.length).toBeGreaterThan(0);

    // A second render with the now-non-empty thread should not re-run.
    const callsBefore = setThread.mock.calls.length;
    renderHook(() =>
      useAiMigration({ ready: true, thread: stored, setThread }),
    );
    expect(setThread.mock.calls.length).toBe(callsBefore);
  });

  it("ignores malformed JSON without throwing", () => {
    localStorage.setItem("QandA", "not-json");
    localStorage.setItem("ai-elements/conversations", "{broken");

    const setThread = jest.fn();
    expect(() =>
      renderHook(() => useAiMigration({ ready: true, thread: [], setThread })),
    ).not.toThrow();

    expect(setThread).not.toHaveBeenCalled();
  });

  it("removes all legacy keys even when there is no data to migrate", () => {
    // Pre-populate legacy keys but no parseable content
    localStorage.setItem("QandA", "[]");
    localStorage.setItem("LastAnswer", "some text");
    LEGACY_KEYS.forEach((k) => localStorage.setItem(k, "x"));

    const setThread = jest.fn();
    renderHook(() => useAiMigration({ ready: true, thread: [], setThread }));

    LEGACY_KEYS.forEach((k) => {
      expect(localStorage.getItem(k)).toBeNull();
    });
    expect(setThread).not.toHaveBeenCalled();
  });

  it("is idempotent across re-renders (single execution)", () => {
    localStorage.setItem(
      "ai-elements/conversations",
      JSON.stringify([{ messages: [{ id: "1", role: "user", content: "x" }] }]),
    );

    const setThread = jest.fn();
    const { rerender } = renderHook(() =>
      useAiMigration({ ready: true, thread: [], setThread }),
    );

    rerender();
    rerender();

    expect(setThread).toHaveBeenCalledTimes(1);
  });
});
