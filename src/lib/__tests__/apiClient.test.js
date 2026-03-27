import {
  ApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  withErrorHandling,
  withMethod,
  ensureMethod,
  getOpenAiApiKey,
  getClientIp,
  getRequestId,
  apiClient,
  logApiEvent,
} from "../apiClient";
import { createMocks } from "node-mocks-http";

jest.spyOn(console, "info").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

describe("apiClient", () => {
  describe("Error Classes", () => {
    describe("ApiError", () => {
      it("should create ApiError with status and message", () => {
        const error = new ApiError("Not found", 404);
        expect(error.message).toBe("Not found");
        expect(error.status).toBe(404);
        expect(error.name).toBe("ApiError");
        expect(error.details).toBeNull();
      });

      it("should create ApiError with details", () => {
        const details = { field: "email" };
        const error = new ApiError("Validation failed", 400, details);
        expect(error.details).toEqual(details);
      });
    });

    describe("NetworkError", () => {
      it("should create NetworkError with default message", () => {
        const error = new NetworkError();
        expect(error.message).toBe("Network error occurred");
        expect(error.status).toBe(500);
        expect(error.name).toBe("NetworkError");
      });

      it("should create NetworkError with custom message", () => {
        const error = new NetworkError("Connection timeout");
        expect(error.message).toBe("Connection timeout");
        expect(error.status).toBe(500);
      });
    });

    describe("ValidationError", () => {
      it("should create ValidationError with default message", () => {
        const error = new ValidationError("Invalid input");
        expect(error.message).toBe("Invalid input");
        expect(error.status).toBe(400);
        expect(error.name).toBe("ValidationError");
      });

      it("should create ValidationError with details", () => {
        const details = [{ field: "email", message: "Invalid format" }];
        const error = new ValidationError("Validation failed", details);
        expect(error.details).toEqual(details);
      });
    });

    describe("AuthenticationError", () => {
      it("should create AuthenticationError with default message", () => {
        const error = new AuthenticationError();
        expect(error.message).toBe("Authentication failed");
        expect(error.status).toBe(401);
        expect(error.name).toBe("AuthenticationError");
      });

      it("should create AuthenticationError with custom message", () => {
        const error = new AuthenticationError("Invalid token");
        expect(error.message).toBe("Invalid token");
      });
    });

    describe("RateLimitError", () => {
      it("should create RateLimitError with retryAfter and resetAt", () => {
        const resetAt = Date.now() + 60000;
        const error = new RateLimitError(60, resetAt);
        expect(error.message).toBe("Rate limit exceeded");
        expect(error.status).toBe(429);
        expect(error.name).toBe("RateLimitError");
        expect(error.details).toEqual({
          retryAfter: 60,
          resetAt,
        });
      });
    });
  });

  describe("withErrorHandling", () => {
    it("should handle successful requests", async () => {
      const handler = withErrorHandling(async (req, res) => {
        res.status(200).json({ success: true });
      });

      const { req, res } = createMocks({ method: "GET" });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ success: true });
      expect(res.getHeader("X-Request-Id")).toBeTruthy();
    });

    it("should preserve incoming request id header", async () => {
      const handler = withErrorHandling(async (req, res) => {
        res.status(200).json({ ok: true });
      });

      const { req, res } = createMocks({
        method: "GET",
        headers: { "x-request-id": "req-123" },
      });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res.getHeader("X-Request-Id")).toBe("req-123");
    });

    it("should handle ApiError", async () => {
      const handler = withErrorHandling(async (req, res) => {
        throw new ApiError("Not found", 404);
      });

      const { req, res } = createMocks({ method: "GET" });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Not found",
        details: null,
      });
    });

    it("should handle NetworkError", async () => {
      const handler = withErrorHandling(async (req, res) => {
        throw new NetworkError("Connection failed");
      });

      const { req, res } = createMocks({ method: "GET" });
      await handler(req, res);

      const data = JSON.parse(res._getData());
      expect(res._getStatusCode()).toBe(500);
      expect(data.error).toBe("Connection failed");
    });

    it("should handle ValidationError", async () => {
      const details = [{ field: "email", message: "Invalid format" }];
      const handler = withErrorHandling(async (req, res) => {
        throw new ValidationError("Validation failed", details);
      });

      const { req, res } = createMocks({ method: "POST" });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Validation failed",
        details,
      });
    });

    it("should handle AuthenticationError", async () => {
      const handler = withErrorHandling(async (req, res) => {
        throw new AuthenticationError("Invalid credentials");
      });

      const { req, res } = createMocks({ method: "POST" });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Invalid credentials",
      });
    });

    it("should handle RateLimitError with headers", async () => {
      const resetAt = Date.now() + 60000;
      const handler = withErrorHandling(async (req, res) => {
        throw new RateLimitError(60, resetAt);
      });

      const { req, res } = createMocks({ method: "POST" });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(429);
      expect(res.getHeader("X-RateLimit-Limit")).toBe("20");
      expect(res.getHeader("X-RateLimit-Remaining")).toBe("0");
      expect(res.getHeader("X-RateLimit-Reset")).toBe(resetAt.toString());
      expect(JSON.parse(res._getData())).toEqual({
        error: "Rate limit exceeded",
        retryAfter: 60,
      });
    });

    it("should handle generic Error", async () => {
      const handler = withErrorHandling(async (req, res) => {
        throw new Error("Unexpected error");
      });

      const { req, res } = createMocks({ method: "GET" });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Unexpected error",
      });
    });

    it("should handle Error without message", async () => {
      const handler = withErrorHandling(async (req, res) => {
        throw new Error();
      });

      const { req, res } = createMocks({ method: "GET" });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Internal Server Error",
      });
    });
  });

  describe("withMethod", () => {
    it("should allow allowed methods", async () => {
      const middleware = withMethod(["GET", "POST"]);
      const req = { method: "GET" };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should reject disallowed methods", async () => {
      const middleware = withMethod(["GET"]);
      const req = { method: "POST" };
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.setHeader).toHaveBeenCalledWith("Allow", "GET");
      expect(res.json).toHaveBeenCalledWith({ error: "Method Not Allowed" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("ensureMethod", () => {
    it("should return true for allowed methods", () => {
      const req = { method: "GET" };
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const result = ensureMethod(req, res, ["GET"]);

      expect(result).toBe(true);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return false and send 405 for disallowed methods", () => {
      const req = { method: "PUT" };
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const result = ensureMethod(req, res, ["GET", "POST"]);

      expect(result).toBe(false);
      expect(res.setHeader).toHaveBeenCalledWith("Allow", "GET, POST");
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: "Method Not Allowed" });
    });
  });

  describe("getOpenAiApiKey", () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should return OPEN_AI_KEY when present", () => {
      process.env = { ...originalEnv, OPEN_AI_KEY: "preferred-key" };
      expect(getOpenAiApiKey()).toBe("preferred-key");
    });

    it("should fallback to OPENAI_API_KEY", () => {
      process.env = {
        ...originalEnv,
        OPEN_AI_KEY: "",
        OPENAI_API_KEY: "fallback-key",
      };
      expect(getOpenAiApiKey()).toBe("fallback-key");
    });
  });

  describe("getClientIp", () => {
    it("should prefer x-forwarded-for", () => {
      const req = {
        headers: {
          "x-forwarded-for": "203.0.113.1, 10.0.0.1",
          "x-real-ip": "198.51.100.2",
        },
      };
      expect(getClientIp(req)).toBe("203.0.113.1");
    });

    it("should fallback to x-real-ip and unknown", () => {
      expect(getClientIp({ headers: { "x-real-ip": "198.51.100.2" } })).toBe(
        "198.51.100.2",
      );
      expect(getClientIp({ headers: {} })).toBe("unknown");
    });
  });

  describe("getRequestId", () => {
    it("should use x-request-id when provided", () => {
      const req = {
        headers: {
          "x-request-id": "req-1",
          "x-correlation-id": "corr-1",
        },
      };
      expect(getRequestId(req)).toBe("req-1");
    });

    it("should fallback to x-correlation-id", () => {
      const req = {
        headers: {
          "x-correlation-id": "corr-1",
        },
      };
      expect(getRequestId(req)).toBe("corr-1");
    });

    it("should generate request id when no headers exist", () => {
      const req = { headers: {} };
      expect(getRequestId(req)).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe("logApiEvent", () => {
    let consoleOutput;
    let consoleInfoSpy;
    let consoleErrorSpy;

    beforeEach(() => {
      consoleOutput = [];
      consoleInfoSpy = jest.spyOn(console, "info").mockImplementation((msg) => {
        consoleOutput.push(JSON.parse(msg));
      });
      consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation((msg) => {
          consoleOutput.push(JSON.parse(msg));
        });
    });

    afterEach(() => {
      consoleInfoSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("should log with enriched context fields", () => {
      const req = {
        requestId: "req-123",
        method: "POST",
        url: "/api/test",
        headers: {
          "user-agent": "TestAgent/1.0",
          "x-forwarded-for": "192.168.1.1",
          "content-length": "1024",
        },
      };

      logApiEvent("info", "api_request", req, { status: 200 });

      expect(consoleOutput[0]).toMatchObject({
        level: "info",
        event: "api_request",
        requestId: "req-123",
        method: "POST",
        route: "/api/test",
        userAgent: "TestAgent/1.0",
        clientIp: "192.168.1.1",
        contentLength: "1024",
        status: 200,
      });
    });

    it("should handle missing optional headers gracefully", () => {
      const req = {
        method: "GET",
        url: "/api/test",
        headers: {},
      };

      logApiEvent("info", "api_request", req, { status: 200 });

      expect(consoleOutput[0]).toMatchObject({
        userAgent: null,
        clientIp: "unknown",
        contentLength: null,
      });
    });

    it("should include durationMs when provided", () => {
      const req = {
        method: "GET",
        url: "/api/test",
        headers: {},
      };

      logApiEvent("info", "api_request", req, { status: 200, durationMs: 150 });

      expect(consoleOutput[0].durationMs).toBe(150);
    });
  });

  describe("ApiClient", () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should make GET request", async () => {
      const mockData = { result: "success" };
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: () => Promise.resolve(mockData),
      });

      const result = await apiClient.get("/api/test");

      expect(fetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "GET",
        }),
      );
      expect(result).toEqual(mockData);
    });

    it("should make POST request", async () => {
      const mockData = { result: "created" };
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: () => Promise.resolve(mockData),
      });

      const result = await apiClient.post("/api/test", { name: "test" });

      expect(fetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "test" }),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it("should handle error responses", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: {
          get: jest.fn().mockReturnValue("application/json"),
        },
        json: () => Promise.resolve({ error: "Not found" }),
      });

      await expect(apiClient.get("/api/test")).rejects.toThrow("Not found");
    });

    it("should handle network errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(apiClient.get("/api/test")).rejects.toThrow("Network error");
    });
  });
});
