import {
  uiMessageText,
  serializeMessages,
  toStoredMessage,
  hydrateMessage,
  hydrateMessages,
  tailEquals,
  toUnixSeconds,
} from "../serializeMessages";

describe("serializeMessages", () => {
  describe("uiMessageText", () => {
    it("extracts text from v5 parts", () => {
      expect(uiMessageText({ parts: [{ type: "text", text: "hello" }] })).toBe(
        "hello",
      );
    });

    it("concatenates multiple text parts", () => {
      expect(
        uiMessageText({
          parts: [
            { type: "text", text: "hello " },
            { type: "text", text: "world" },
          ],
        }),
      ).toBe("hello world");
    });

    it("ignores non-text parts (tool calls, sources, etc.)", () => {
      expect(
        uiMessageText({
          parts: [
            { type: "text", text: "a" },
            { type: "tool-call", toolCallId: "1" },
            { type: "text", text: "b" },
          ],
        }),
      ).toBe("ab");
    });

    it("falls back to legacy `content` string", () => {
      expect(uiMessageText({ content: "legacy" })).toBe("legacy");
    });

    it("falls back to legacy `text` string", () => {
      expect(uiMessageText({ text: "older" })).toBe("older");
    });

    it("returns empty string for null/undefined/empty input", () => {
      expect(uiMessageText(null)).toBe("");
      expect(uiMessageText(undefined)).toBe("");
      expect(uiMessageText({})).toBe("");
    });
  });

  describe("toStoredMessage", () => {
    it("returns null for falsy or role-less messages", () => {
      expect(toStoredMessage(null)).toBeNull();
      expect(toStoredMessage(undefined)).toBeNull();
      expect(toStoredMessage({})).toBeNull();
    });

    it("preserves id, role, and content", () => {
      const result = toStoredMessage({
        id: "m1",
        role: "user",
        parts: [{ type: "text", text: "hi" }],
      });
      expect(result).toMatchObject({
        id: "m1",
        role: "user",
        content: "hi",
      });
      expect(typeof result.timestamp).toBe("number");
    });

    it("uses createdAt when provided (Date)", () => {
      const date = new Date("2025-01-01T00:00:00Z");
      const result = toStoredMessage({
        id: "m1",
        role: "assistant",
        content: "x",
        createdAt: date,
      });
      expect(result.timestamp).toBe(Math.round(date.getTime() / 1000));
    });

    it("uses createdAt when provided (number, ms)", () => {
      const result = toStoredMessage({
        id: "m1",
        role: "assistant",
        content: "x",
        createdAt: 1_700_000_000_000,
      });
      expect(result.timestamp).toBe(1_700_000_000);
    });
  });

  describe("serializeMessages", () => {
    it("maps an array of UI messages to stored shape", () => {
      const messages = [
        {
          id: "1",
          role: "user",
          parts: [{ type: "text", text: "hi" }],
        },
        {
          id: "2",
          role: "assistant",
          parts: [{ type: "text", text: "hello" }],
        },
      ];
      const result = serializeMessages(messages);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: "1", role: "user", content: "hi" });
      expect(result[1]).toMatchObject({
        id: "2",
        role: "assistant",
        content: "hello",
      });
    });

    it("returns an empty array for empty/null input", () => {
      expect(serializeMessages([])).toEqual([]);
      expect(serializeMessages(null)).toEqual([]);
      expect(serializeMessages(undefined)).toEqual([]);
    });

    it("filters out messages missing a role", () => {
      const result = serializeMessages([
        { id: "1", role: "user", content: "ok" },
        { id: "2" }, // no role
      ]);
      expect(result).toHaveLength(1);
    });
  });

  describe("hydrateMessage", () => {
    it("produces a v5 UI message shape", () => {
      const result = hydrateMessage({
        id: "x",
        role: "assistant",
        content: "hi",
      });
      expect(result).toEqual({
        id: "x",
        role: "assistant",
        parts: [{ type: "text", text: "hi" }],
      });
    });

    it("generates a fallback id when missing", () => {
      const result = hydrateMessage({ role: "user", content: "x" });
      expect(typeof result.id).toBe("string");
      expect(result.id.length).toBeGreaterThan(0);
    });

    it("coerces non-string content to string", () => {
      expect(
        hydrateMessage({ id: "x", role: "user", content: 42 }).parts[0].text,
      ).toBe("42");
      expect(
        hydrateMessage({ id: "x", role: "user", content: undefined }).parts[0]
          .text,
      ).toBe("");
    });
  });

  describe("hydrateMessages", () => {
    it("hydrates a full array", () => {
      const result = hydrateMessages([
        { id: "1", role: "user", content: "a" },
        { id: "2", role: "assistant", content: "b" },
      ]);
      expect(result).toHaveLength(2);
      expect(result[0].parts[0].text).toBe("a");
      expect(result[1].parts[0].text).toBe("b");
    });

    it("handles null/empty input", () => {
      expect(hydrateMessages(null)).toEqual([]);
      expect(hydrateMessages([])).toEqual([]);
    });
  });

  describe("tailEquals", () => {
    it("returns true when length and tail match", () => {
      const a = [
        { id: "1", content: "a" },
        { id: "2", content: "b" },
      ];
      const b = [
        { id: "different", content: "x" },
        { id: "2", content: "b" },
      ];
      expect(tailEquals(a, b)).toBe(true);
    });

    it("returns false when length differs", () => {
      expect(
        tailEquals(
          [{ id: "1", content: "a" }],
          [
            { id: "1", content: "a" },
            { id: "2", content: "b" },
          ],
        ),
      ).toBe(false);
    });

    it("returns false when tail id differs", () => {
      expect(
        tailEquals([{ id: "1", content: "a" }], [{ id: "2", content: "a" }]),
      ).toBe(false);
    });

    it("returns false when tail content differs", () => {
      expect(
        tailEquals([{ id: "1", content: "a" }], [{ id: "1", content: "b" }]),
      ).toBe(false);
    });

    it("returns true for two empty arrays", () => {
      expect(tailEquals([], [])).toBe(true);
    });

    it("returns false when either side is null/undefined", () => {
      expect(tailEquals(null, [])).toBe(false);
      expect(tailEquals([], undefined)).toBe(false);
    });
  });

  describe("toUnixSeconds", () => {
    it("converts a Date to unix seconds", () => {
      const date = new Date(1_700_000_000_000);
      expect(toUnixSeconds(date)).toBe(1_700_000_000);
    });

    it("treats small numbers as seconds", () => {
      expect(toUnixSeconds(1_700_000_000)).toBe(1_700_000_000);
    });

    it("treats large numbers as milliseconds", () => {
      expect(toUnixSeconds(1_700_000_000_000)).toBe(1_700_000_000);
    });

    it("parses ISO strings", () => {
      expect(toUnixSeconds("2025-01-01T00:00:00Z")).toBe(
        Math.round(Date.parse("2025-01-01T00:00:00Z") / 1000),
      );
    });

    it("returns null for null/undefined/NaN", () => {
      expect(toUnixSeconds(null)).toBeNull();
      expect(toUnixSeconds(undefined)).toBeNull();
      expect(toUnixSeconds(NaN)).toBeNull();
      expect(toUnixSeconds("not a date")).toBeNull();
    });
  });
});
