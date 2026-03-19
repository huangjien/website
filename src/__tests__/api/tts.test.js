import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";

const mockSpeechCreate = jest.fn();

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

jest.mock("openai", () =>
  jest.fn().mockImplementation(() => ({
    audio: {
      speech: {
        create: mockSpeechCreate,
      },
    },
  })),
);

describe("/api/tts", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockSpeechCreate.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 405 for non-GET methods", async () => {
    const handler = require("../../pages/api/tts").default;
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader("Allow")).toBe("GET");
  });

  it("returns 401 when session is missing", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const handler = require("../../pages/api/tts").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { text: "hello" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toMatchObject({ error: "Unauthorized" });
  });

  it("returns 500 when OpenAI key is missing", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
    delete process.env.OPEN_AI_KEY;
    delete process.env.OPENAI_API_KEY;
    const handler = require("../../pages/api/tts").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { text: "hello" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: "OpenAI API key not configured",
    });
  });

  it("returns 400 when text is empty", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
    process.env.OPENAI_API_KEY = "test-key";
    const handler = require("../../pages/api/tts").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { text: "   " },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe("Text is required");
  });

  it("returns audio content on success", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
    process.env.OPENAI_API_KEY = "test-key";
    mockSpeechCreate.mockResolvedValueOnce({
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    });

    const handler = require("../../pages/api/tts").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { text: "hello", format: "wav" },
    });

    await handler(req, res);

    expect(mockSpeechCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        input: "hello",
        response_format: "wav",
      }),
    );
    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader("Content-Type")).toBe("audio/wav");
  });

  it("returns 502 when provider fails", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "a@test.com" } });
    process.env.OPENAI_API_KEY = "test-key";
    mockSpeechCreate.mockRejectedValueOnce(new Error("upstream failed"));

    const handler = require("../../pages/api/tts").default;
    const { req, res } = createMocks({
      method: "GET",
      query: { text: "hello" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(502);
    const body = JSON.parse(res._getData());
    expect(body.error).toBe("Text-to-speech failed");
    expect(body.details).toBe("upstream failed");
  });
});
