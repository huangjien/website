import {
  formatTimestamp,
  formatMessageTimestamp,
  messageTimestamp,
  resolveTimestamp,
} from "../formatTimestamp";

const tStub = (key) => {
  const map = {
    "ai.timestamp_now": "Just now",
    "ai.timestamp_mins_ago": "min ago",
    "ai.timestamp_hours_ago": "h ago",
  };
  return map[key];
};

describe("formatTimestamp", () => {
  const NOW_MS = 1_700_000_300_000; // arbitrary anchor
  const now = () => NOW_MS;

  it("returns empty string when input is null/undefined", () => {
    expect(formatTimestamp(null, tStub, { now })).toBe("");
    expect(formatTimestamp(undefined, tStub, { now })).toBe("");
  });

  it("returns 'Just now' within the same minute", () => {
    expect(formatTimestamp(NOW_MS, tStub, { now })).toBe("Just now");
    expect(formatTimestamp(NOW_MS - 30_000, tStub, { now })).toBe("Just now");
  });

  it("formats minutes ago", () => {
    expect(formatTimestamp(NOW_MS - 5 * 60_000, tStub, { now })).toBe(
      "5 min ago",
    );
  });

  it("formats hours ago", () => {
    expect(formatTimestamp(NOW_MS - 3 * 3600_000, tStub, { now })).toBe(
      "3 h ago",
    );
  });

  it("falls back to localized time after 24h", () => {
    const date = new Date(NOW_MS - 30 * 3600_000);
    expect(formatTimestamp(date, tStub, { now })).toBe(
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
  });

  it("uses default English strings when t is missing", () => {
    expect(formatTimestamp(NOW_MS - 5 * 60_000, undefined, { now })).toBe(
      "5 min(s) ago",
    );
    expect(formatTimestamp(NOW_MS, undefined, { now })).toBe("Just now");
  });

  it("interprets small numeric values as seconds", () => {
    const seconds = Math.floor((NOW_MS - 2 * 3600_000) / 1000);
    expect(formatTimestamp(seconds, tStub, { now })).toBe("2 h ago");
  });
});

describe("formatMessageTimestamp", () => {
  const NOW_MS = 1_700_000_300_000;
  const now = () => NOW_MS;

  it("prefers createdAt when present", () => {
    expect(
      formatMessageTimestamp(
        { createdAt: NOW_MS - 60_000, timestamp: NOW_MS / 1000 - 86_400_000 },
        tStub,
        { now },
      ),
    ).toBe("1 min ago");
  });

  it("falls back to legacy `timestamp` when createdAt is absent", () => {
    // legacy seconds
    expect(
      formatMessageTimestamp(
        { timestamp: Math.floor((NOW_MS - 5 * 60_000) / 1000) },
        tStub,
        { now },
      ),
    ).toBe("5 min ago");
  });

  it("falls back to the current time when neither is present", () => {
    expect(formatMessageTimestamp({}, tStub, { now })).toBe("Just now");
  });

  it("handles null/undefined messages", () => {
    expect(formatMessageTimestamp(null, tStub, { now })).toBe("Just now");
    expect(formatMessageTimestamp(undefined, tStub, { now })).toBe("Just now");
  });

  it("treats Date instances correctly", () => {
    const date = new Date(NOW_MS - 90_000);
    expect(formatMessageTimestamp({ createdAt: date }, tStub, { now })).toBe(
      "1 min ago",
    );
  });
});

describe("messageTimestamp", () => {
  it("returns createdAt as unix seconds", () => {
    expect(messageTimestamp({ createdAt: 1_700_000_000_000 })).toBe(
      1_700_000_000,
    );
  });

  it("returns timestamp as unix seconds (legacy localStorage shape)", () => {
    expect(messageTimestamp({ timestamp: 1_700_000_000 })).toBe(1_700_000_000);
  });

  it("prefers createdAt over timestamp", () => {
    expect(
      messageTimestamp({ createdAt: 1_700_000_000_000, timestamp: 0 }),
    ).toBe(1_700_000_000);
  });

  it("falls back to current time for empty/null message", () => {
    const before = Math.floor(Date.now() / 1000);
    const result = messageTimestamp({});
    const after = Math.floor(Date.now() / 1000);
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });
});

describe("resolveTimestamp", () => {
  it("converts ms Date to seconds", () => {
    expect(resolveTimestamp(new Date(1_700_000_000_000))).toBe(1_700_000_000);
  });

  it("returns null for invalid input", () => {
    expect(resolveTimestamp("garbage")).toBeNull();
    expect(resolveTimestamp({})).toBeNull();
    expect(resolveTimestamp([])).toBeNull();
  });
});
