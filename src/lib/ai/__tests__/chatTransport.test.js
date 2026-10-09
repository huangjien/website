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
