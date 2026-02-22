import handler from "../../pages/api/ai";
import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";

// Mock next-auth
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables - prefer OPENAI_API_KEY (the secret name in GCP)
process.env.OPENAI_API_KEY = "test-openai-key";

describe("/api/ai", () => {
  beforeEach(() => {
    fetch.mockClear();
    getServerSession.mockClear();
  });

  it("should return AI response successfully when authenticated", async () => {
    // Mock authenticated session
    getServerSession.mockResolvedValueOnce({
      user: { email: "test@example.com" },
    });

    const mockAIResponse = {
      choices: [
        {
          message: {
            content: "Hello! This is a test AI response.",
          },
        },
      ],
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockAIResponse),
      ok: true,
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        messages: [{ role: "user", content: "Hello" }],
      },
    });

    await handler(req, res);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-openai-key",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Hello" }],
          temperature: undefined,
        }),
      }),
    );
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockAIResponse);
  });

  it("should return 401 when not authenticated", async () => {
    // Mock unauthenticated session
    getServerSession.mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      method: "POST",
      body: {
        messages: [{ role: "user", content: "Hello" }],
      },
    });

    await handler(req, res);

    expect(fetch).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: "Unauthorized",
    });
  });

  it("should handle OpenAI API errors gracefully", async () => {
    // Mock authenticated session
    getServerSession.mockResolvedValueOnce({
      user: { email: "test@example.com" },
    });

    const mockError = new Error("Rate limit exceeded");

    fetch.mockRejectedValueOnce(mockError);

    const { req, res } = createMocks({
      method: "POST",
      body: {
        messages: [{ role: "user", content: "Hello" }],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("Rate limit exceeded");
  });

  it("should handle missing OpenAI API key", async () => {
    // Temporarily remove API keys
    const originalOpenAiKey = process.env.OPEN_AI_KEY;
    const originalOpenaiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPEN_AI_KEY;
    delete process.env.OPENAI_API_KEY;

    // Mock authenticated session
    getServerSession.mockResolvedValueOnce({
      user: { email: "test@example.com" },
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        messages: [{ role: "user", content: "Hello" }],
      },
    });

    await handler(req, res);

    expect(fetch).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: "OpenAI API key not configured",
    });

    // Restore API key
    process.env.OPENAI_API_KEY = originalOpenaiKey;
    if (originalOpenAiKey) {
      process.env.OPEN_AI_KEY = originalOpenAiKey;
    }
  });

  it("should only accept POST method", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("should return 400 when messages are missing", async () => {
    // Mock authenticated session
    getServerSession.mockResolvedValueOnce({
      user: { email: "test@example.com" },
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        model: "gpt-4o-mini",
        // missing messages field
      },
    });

    await handler(req, res);

    expect(fetch).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: "Validation failed",
    });
  });
});
