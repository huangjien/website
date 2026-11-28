import { DefaultChatTransport } from "ai";
import { createChatTransport, transportDeps } from "../chatTransport";

jest.mock("ai", () => {
  class FakeTransport {
    constructor(options) {
      this.options = options;
    }
    get api() {
      return this.options.api;
    }
    get prepareSendMessagesRequest() {
      return this.options.prepareSendMessagesRequest;
    }
  }
  return { DefaultChatTransport: FakeTransport };
});

describe("createChatTransport fallback notification", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("notifies onModelFallback when the server reports a fallback", async () => {
    const onModelFallback = jest.fn();
    const transport = createChatTransport({ model: "gpt-4o" }, onModelFallback);
    global.fetch = jest.fn(async () => ({
      headers: {
        get: (name) =>
          name === "x-ai-fallback-from"
            ? "gpt-4o"
            : name === "x-ai-model"
              ? "gpt-4o-mini"
              : null,
      },
    }));

    await transport.options.fetch("/api/chat", {});

    expect(global.fetch).toHaveBeenCalledWith("/api/chat", {});
    expect(onModelFallback).toHaveBeenCalledWith({
      from: "gpt-4o",
      servedBy: "gpt-4o-mini",
    });
  });

  it("does not notify when the requested model served the response", async () => {
    const onModelFallback = jest.fn();
    const transport = createChatTransport({}, onModelFallback);
    global.fetch = jest.fn(async () => ({
      headers: {
        get: (name) => (name === "x-ai-model" ? "gpt-4o-mini" : null),
      },
    }));

    await transport.options.fetch("/api/chat", {});

    expect(onModelFallback).not.toHaveBeenCalled();
  });

  it("still returns the response when header inspection throws", async () => {
    const transport = createChatTransport({}, () => {
      throw new Error("callback exploded");
    });
    const response = {
      headers: {
        get: () => "gpt-4o",
      },
    };
    global.fetch = jest.fn(async () => response);

    const result = await transport.options.fetch("/api/chat", {});

    expect(result).toBe(response);
  });
});

describe("createChatTransport", () => {
  it("returns a DefaultChatTransport pointed at /api/chat", () => {
    const transport = createChatTransport({ model: "gpt-4o-mini" });
    expect(transport).toBeInstanceOf(DefaultChatTransport);
    expect(transport.api).toBe("/api/chat");
  });

  it("uses model, temperature, and systemPrompt in the request body", () => {
    const transport = createChatTransport({
      model: "gpt-4.1",
      temperature: 0.4,
      systemPrompt: "You are concise.",
    });
    const prep = transport.prepareSendMessagesRequest;
    const out = prep({ messages: [{ role: "user", content: "hi" }] });
    expect(out.body.model).toBe("gpt-4.1");
    expect(out.body.temperature).toBeCloseTo(0.4);
    expect(out.body.system).toBe("You are concise.");
  });

  it("coerces string temperature to a number", () => {
    const transport = createChatTransport({ temperature: "0.7" });
    const out = transport.prepareSendMessagesRequest({ messages: [] });
    expect(out.body.temperature).toBeCloseTo(0.7);
  });

  it("falls back to temperature 1 when missing", () => {
    const transport = createChatTransport({});
    const out = transport.prepareSendMessagesRequest({ messages: [] });
    expect(out.body.temperature).toBeCloseTo(1);
  });

  it("omits system when systemPrompt is empty/falsy", () => {
    const transport = createChatTransport({ systemPrompt: "" });
    const out = transport.prepareSendMessagesRequest({ messages: [] });
    expect(out.body.system).toBeUndefined();
  });

  it("forwards the messages array unchanged", () => {
    const transport = createChatTransport({});
    const messages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "hi" }] },
    ];
    const out = transport.prepareSendMessagesRequest({ messages });
    expect(out.body.messages).toBe(messages);
  });

  it("handles null settings gracefully", () => {
    const transport = createChatTransport(null);
    const out = transport.prepareSendMessagesRequest({ messages: [] });
    expect(out.body.model).toBeUndefined();
    expect(out.body.temperature).toBeCloseTo(1);
    expect(out.body.system).toBeUndefined();
  });
});

describe("transportDeps", () => {
  it("changes when any input changes", () => {
    const base = { model: "gpt-4o-mini", temperature: 1, systemPrompt: "x" };
    expect(transportDeps(base)).not.toBe(
      transportDeps({ ...base, model: "gpt-4o" }),
    );
    expect(transportDeps(base)).not.toBe(
      transportDeps({ ...base, temperature: 0.5 }),
    );
    expect(transportDeps(base)).not.toBe(
      transportDeps({ ...base, systemPrompt: "y" }),
    );
  });

  it("is stable when nothing changes", () => {
    const a = { model: "m", temperature: 0.3, systemPrompt: "p" };
    const b = { model: "m", temperature: 0.3, systemPrompt: "p" };
    expect(transportDeps(a)).toBe(transportDeps(b));
  });

  it("treats missing fields as stable", () => {
    expect(transportDeps(null)).toBe(transportDeps(undefined));
    expect(transportDeps({})).toBe(transportDeps({}));
  });
});
