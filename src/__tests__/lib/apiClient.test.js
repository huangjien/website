import {
  ApiClient,
  apiClient,
  withErrorHandling,
  withValidation,
  withRateLimit,
  withMethod,
  ApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
} from "../../lib/apiClient";

describe("ApiClient", () => {
  let client;
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    client = new ApiClient({
      baseURL: "https://api.test.com",
      timeout: 5000,
    });
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  describe("ApiClient Error Classes", () => {
    it("creates ApiError with correct properties", () => {
      const error = new ApiError("Test error", 404, { detail: "Not found" });
      expect(error.name).toBe("ApiError");
      expect(error.message).toBe("Test error");
      expect(error.status).toBe(404);
      expect(error.details).toEqual({ detail: "Not found" });
    });

    it("creates NetworkError with default properties", () => {
      const error = new NetworkError();
      expect(error.name).toBe("NetworkError");
      expect(error.message).toBe("Network error occurred");
      expect(error.status).toBe(500);
    });

    it("creates ValidationError with details", () => {
      const error = new ValidationError("Invalid input", { field: "email" });
      expect(error.name).toBe("ValidationError");
      expect(error.message).toBe("Invalid input");
      expect(error.status).toBe(400);
      expect(error.details).toEqual({ field: "email" });
    });

    it("creates AuthenticationError with default message", () => {
      const error = new AuthenticationError();
      expect(error.name).toBe("AuthenticationError");
      expect(error.message).toBe("Authentication failed");
      expect(error.status).toBe(401);
    });

    it("creates RateLimitError with retry information", () => {
      const error = new RateLimitError(60, 1234567890);
      expect(error.name).toBe("RateLimitError");
      expect(error.message).toBe("Rate limit exceeded");
      expect(error.status).toBe(429);
      expect(error.details).toEqual({ retryAfter: 60, resetAt: 1234567890 });
    });
  });

  describe("ApiClient Constructor", () => {
    it("creates client with default config", () => {
      const defaultClient = new ApiClient();
      expect(defaultClient.baseURL).toBe("");
      expect(defaultClient.timeout).toBe(30000);
      expect(defaultClient.defaultHeaders).toEqual({
        "Content-Type": "application/json",
      });
    });

    it("creates client with custom config", () => {
      const customClient = new ApiClient({
        baseURL: "https://api.example.com",
        timeout: 10000,
        headers: { "X-Custom-Header": "value" },
      });
      expect(customClient.baseURL).toBe("https://api.example.com");
      expect(customClient.timeout).toBe(10000);
      expect(customClient.defaultHeaders).toEqual({
        "Content-Type": "application/json",
        "X-Custom-Header": "value",
      });
    });

    it("initializes with empty interceptors", () => {
      expect(client.interceptors.request).toEqual([]);
      expect(client.interceptors.response).toEqual([]);
    });
  });

  describe("Request Interceptors", () => {
    it("adds request interceptor", () => {
      const interceptor = jest.fn();
      client.addRequestInterceptor(interceptor);
      expect(client.interceptors.request).toContain(interceptor);
    });

    it("executes request interceptors in order", async () => {
      const interceptor1 = jest.fn();
      const interceptor2 = jest.fn();

      client.addRequestInterceptor(interceptor1);
      client.addRequestInterceptor(interceptor2);

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve({ success: true }),
      });

      await client.get("/test");

      expect(interceptor1).toHaveBeenCalled();
      expect(interceptor2).toHaveBeenCalled();
    });
  });

  describe("Response Interceptors", () => {
    it("adds response interceptor", () => {
      const interceptor = jest.fn();
      client.addResponseInterceptor(interceptor);
      expect(client.interceptors.response).toContain(interceptor);
    });

    it("executes response interceptors with response and data", async () => {
      const interceptor = jest.fn();
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: (name) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve({ success: true }),
      };

      client.addResponseInterceptor(interceptor);
      mockFetch.mockResolvedValue(mockResponse);

      await client.get("/test");

      expect(interceptor).toHaveBeenCalled();
      expect(interceptor.mock.calls[0][0]).toBe(mockResponse);
    });
  });

  describe("GET Requests", () => {
    it("makes successful GET request", async () => {
      const mockData = { id: 1, name: "Test" };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve(mockData),
      });

      const result = await client.get("/users/1");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/users/1",
        expect.objectContaining({
          method: "GET",
        }),
      );
      expect(result).toEqual(mockData);
    });

    it("handles GET request with custom headers", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve({}),
      });

      await client.get("/test", {
        headers: { "X-Auth-Token": "token123" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Auth-Token": "token123",
          }),
        }),
      );
    });
  });

  describe("POST Requests", () => {
    it("makes successful POST request with JSON body", async () => {
      const postData = { name: "Test", email: "test@example.com" };
      const mockResponse = { id: 1, ...postData };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.post("/users", postData);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("PUT Requests", () => {
    it("makes successful PUT request", async () => {
      const updateData = { id: 1, name: "Updated" };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve(updateData),
      });

      const result = await client.put("/users/1", updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/users/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
      );
      expect(result).toEqual(updateData);
    });
  });

  describe("DELETE Requests", () => {
    it("makes successful DELETE request", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve({ success: true }),
      });

      await client.delete("/users/1");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/users/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("Error Handling", () => {
    it("throws ApiError on non-OK response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        headers: {
          get: (name) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve({ error: "Not found" }),
      });

      await expect(client.get("/users/999")).rejects.toThrow(ApiError);
    });

    it("throws ApiError with custom message", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        headers: {
          get: (name) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve({ message: "Bad request" }),
      });

      await expect(client.post("/users", {})).rejects.toThrow("Bad request");
    });

    it("throws NetworkError on fetch failure", async () => {
      mockFetch.mockRejectedValue(new Error("Network failure"));

      await expect(client.get("/test")).rejects.toThrow(NetworkError);
    });

    it("configures timeout correctly", () => {
      const timeoutClient = new ApiClient({ timeout: 5000 });
      expect(timeoutClient.timeout).toBe(5000);
    });
  });

  describe("Content Type Handling", () => {
    it("parses JSON response", async () => {
      const jsonData = { key: "value" };
      mockFetch.mockResolvedValue({
        ok: true,
        headers: {
          get: (name) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve(jsonData),
      });

      const result = await client.get("/test");
      expect(result).toEqual(jsonData);
    });

    it("parses text response when not JSON", async () => {
      const textData = "Plain text response";
      mockFetch.mockResolvedValue({
        ok: true,
        headers: {
          get: (name) => (name === "content-type" ? "text/plain" : null),
        },
        text: () => Promise.resolve(textData),
      });

      const result = await client.get("/test");
      expect(result).toBe(textData);
    });
  });
});

describe("withErrorHandling", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("handles ValidationError", async () => {
    const error = new ValidationError("Invalid input", { field: "email" });
    const handler = async () => {
      throw error;
    };
    const wrappedHandler = withErrorHandling(handler);

    await wrappedHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid input",
      details: { field: "email" },
    });
  });

  it("handles AuthenticationError", async () => {
    const error = new AuthenticationError("Unauthorized");
    const handler = async () => {
      throw error;
    };
    const wrappedHandler = withErrorHandling(handler);

    await wrappedHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  it("handles RateLimitError with headers", async () => {
    const resetAt = Date.now() + 60000;
    const error = new RateLimitError(60, resetAt);
    const handler = async () => {
      throw error;
    };
    const wrappedHandler = withErrorHandling(handler);

    await wrappedHandler(mockReq, mockRes);

    expect(mockRes.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", "20");
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Remaining",
      "0",
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Reset",
      resetAt.toString(),
    );
    expect(mockRes.status).toHaveBeenCalledWith(429);
  });

  it("handles generic ApiError", async () => {
    const error = new ApiError("Custom error", 418, { detail: "I'm a teapot" });
    const handler = async () => {
      throw error;
    };
    const wrappedHandler = withErrorHandling(handler);

    await wrappedHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(418);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Custom error",
      details: { detail: "I'm a teapot" },
    });
  });

  it("handles unexpected errors", async () => {
    const error = new Error("Unexpected error");
    const handler = async () => {
      throw error;
    };
    const wrappedHandler = withErrorHandling(handler);

    await wrappedHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Unexpected error",
    });
  });

  it("passes through successful requests", async () => {
    const handler = async () => {
      return { success: true };
    };
    const wrappedHandler = withErrorHandling(handler);

    const result = await wrappedHandler(mockReq, mockRes);

    expect(result).toEqual({ success: true });
    expect(mockRes.status).not.toHaveBeenCalled();
  });
});

describe("withMethod", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { method: "GET" };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("allows allowed methods", () => {
    const middleware = withMethod(["GET", "POST"]);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("blocks disallowed methods", () => {
    mockReq.method = "DELETE";
    const middleware = withMethod(["GET", "POST"]);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Method not allowed" });
  });
});

describe("withRateLimit", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {
        "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        "x-real-ip": "10.0.0.1",
      },
    };
    mockRes = {
      setHeader: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("sets rate limit headers", () => {
    const middleware = withRateLimit(100, 60000);
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", "100");
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Remaining",
      expect.any(String),
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Reset",
      expect.any(String),
    );
  });

  it("calls next when allowed", () => {
    const middleware = withRateLimit(100, 60000);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it("uses x-forwarded-for for IP when available", async () => {
    const middleware = withRateLimit(100, 60000);
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Remaining",
      expect.any(String),
    );
  });

  it("uses x-real-ip when x-forwarded-for not available", async () => {
    mockReq.headers = { "x-real-ip": "192.168.1.100" };
    const middleware = withRateLimit(100, 60000);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it("uses 'unknown' when no IP headers available", async () => {
    mockReq.headers = {};
    const middleware = withRateLimit(100, 60000);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});

describe("withValidation", () => {
  it("throws ValidationError when validation fails", () => {
    const mockSchema = {
      validate: (body) => ({
        error: {
          details: [{ message: "Invalid email", path: ["email"] }],
        },
        value: null,
      }),
    };

    const middleware = withValidation(mockSchema);
    const mockReq = { body: { email: "invalid" } };
    const mockRes = {};
    const mockNext = jest.fn();

    expect(() => middleware(mockReq, mockRes, mockNext)).toThrow(
      ValidationError,
    );
  });

  it("sets validatedBody and calls next when validation passes", () => {
    const validatedValue = { email: "test@example.com", name: "Test" };
    const mockSchema = {
      validate: (body) => ({
        error: null,
        value: validatedValue,
      }),
    };

    const middleware = withValidation(mockSchema);
    const mockReq = { body: { email: "test@example.com" } };
    const mockRes = {};
    const mockNext = jest.fn();

    middleware(mockReq, mockRes, mockNext);

    expect(mockReq.validatedBody).toEqual(validatedValue);
    expect(mockNext).toHaveBeenCalled();
  });
});
