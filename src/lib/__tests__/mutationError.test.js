import {
  getMutationErrorMessage,
  parseMutationErrorPayload,
} from "../mutationError";

describe("mutationError", () => {
  const t = (key, options = {}) => {
    const template = options.defaultValue || key;
    if (!template.includes("{{seconds}}")) {
      return template;
    }
    return template.replace("{{seconds}}", String(options.seconds || ""));
  };

  it("returns auth message for 401 and 403", () => {
    const unauthorized = getMutationErrorMessage({
      response: { status: 401 },
      payload: {},
      t,
      authKey: "auth",
      validationKey: "validation",
      rateLimitKey: "rate",
      timeoutKey: "timeout",
      serverKey: "server",
      fallbackKey: "fallback",
      fallbackDefaultValue: "fallback",
    });

    const forbidden = getMutationErrorMessage({
      response: { status: 403 },
      payload: {},
      t,
      authKey: "auth",
      validationKey: "validation",
      rateLimitKey: "rate",
      timeoutKey: "timeout",
      serverKey: "server",
      fallbackKey: "fallback",
      fallbackDefaultValue: "fallback",
    });

    expect(unauthorized).toContain("sign in");
    expect(forbidden).toContain("sign in");
  });

  it("returns payload validation message for 400", () => {
    const message = getMutationErrorMessage({
      response: { status: 400 },
      payload: { error: "Title is required" },
      t,
      authKey: "auth",
      validationKey: "validation",
      rateLimitKey: "rate",
      timeoutKey: "timeout",
      serverKey: "server",
      fallbackKey: "fallback",
      fallbackDefaultValue: "fallback",
    });

    expect(message).toBe("Title is required");
  });

  it("returns actionable rate-limit message with retryAfter", () => {
    const message = getMutationErrorMessage({
      response: { status: 429, headers: { get: () => null } },
      payload: { retryAfter: 9.4 },
      t,
      authKey: "auth",
      validationKey: "validation",
      rateLimitKey: "rate",
      timeoutKey: "timeout",
      serverKey: "server",
      fallbackKey: "fallback",
      fallbackDefaultValue: "fallback",
    });

    expect(message).toContain("10");
    expect(message).toContain("Rate limit");
  });

  it("returns timeout message for 504", () => {
    const message = getMutationErrorMessage({
      response: { status: 504 },
      payload: {},
      t,
      authKey: "auth",
      validationKey: "validation",
      rateLimitKey: "rate",
      timeoutKey: "timeout",
      serverKey: "server",
      fallbackKey: "fallback",
      fallbackDefaultValue: "fallback",
    });

    expect(message).toContain("timed out");
  });

  it("returns server message for 5xx", () => {
    const message = getMutationErrorMessage({
      response: { status: 502 },
      payload: {},
      t,
      authKey: "auth",
      validationKey: "validation",
      rateLimitKey: "rate",
      timeoutKey: "timeout",
      serverKey: "server",
      fallbackKey: "fallback",
      fallbackDefaultValue: "fallback",
    });

    expect(message).toContain("server");
  });

  it("parses error payload safely", async () => {
    const payload = await parseMutationErrorPayload({
      json: async () => ({ error: "bad request" }),
    });
    expect(payload).toEqual({ error: "bad request" });

    const fallback = await parseMutationErrorPayload({
      json: async () => {
        throw new Error("invalid json");
      },
    });
    expect(fallback).toEqual({});
  });
});
