import {
  ApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  withErrorHandling,
  withMethod,
  apiClient,
} from "../apiClient";
import { createMocks } from "node-mocks-http";

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
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: "Method not allowed" });
      expect(next).not.toHaveBeenCalled();
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
