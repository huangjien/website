import { createMocks } from "node-mocks-http";

describe("/api/ai-models", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // 创建一个完全干净的环境变量对象
    process.env = { ...originalEnv };
    // 显式删除所有可能的环境变量
    delete process.env.OPEN_AI_KEY;
    delete process.env.OPENAI_API_KEY;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns curated fallback list when API key is missing", async () => {
    delete process.env.OPEN_AI_KEY;
    delete process.env.OPENAI_API_KEY;

    const handler = require("../../pages/api/ai-models").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.source).toBe("fallback");
    expect(Array.isArray(data.models)).toBe(true);
    expect(data.models).toHaveLength(10);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns filtered live list from OpenAI API", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: "gpt-4o-mini" },
          { id: "gpt-4.1" },
          { id: "o1" },
          { id: "unknown-model" },
        ],
      }),
    });

    const handler = require("../../pages/api/ai-models").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.source).toBe("live");
    expect(data.models.map((m) => m.id)).toEqual([
      "gpt-4o-mini",
      "gpt-4.1",
      "o1",
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/models",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        },
      },
    );
  });

  it("returns 405 for non-GET methods", async () => {
    const handler = require("../../pages/api/ai-models").default;
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
