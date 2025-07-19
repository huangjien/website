import handler from "../../pages/api/ai";
import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";

// Mock next-auth
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
process.env.OPEN_API_KEY = "test-openai-key";

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
      })
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
    expect(JSON.parse(res._getData())).toEqual({
      error: "Unauthorized",
    });
  });

  it("should handle OpenAI API errors gracefully", async () => {
    // Mock authenticated session
    getServerSession.mockResolvedValueOnce({
      user: { email: "test@example.com" },
    });

    const mockError = new Error("OpenAI API error");
    mockError.status = 429;
    mockError.message = "Rate limit exceeded";

    fetch.mockRejectedValueOnce(mockError);

    const { req, res } = createMocks({
      method: "POST",
      body: {
        messages: [{ role: "user", content: "Hello" }],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(429);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Rate limit exceeded",
    });
  });

  it("should handle missing OpenAI API key", async () => {
    // Temporarily remove API key
    const originalKey = process.env.OPEN_API_KEY;
    delete process.env.OPEN_API_KEY;

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
    expect(JSON.parse(res._getData())).toEqual({
      error: "Internal Server Error",
    });

    // Restore API key
    process.env.OPEN_API_KEY = originalKey;
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
    expect(JSON.parse(res._getData())).toEqual({
      error: "Missing required fields: messages",
    });
  });
});
