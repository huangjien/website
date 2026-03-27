import {
  recordRequest,
  recordError,
  getMetrics,
  resetMetrics,
  withMetrics,
} from "../metrics";

describe("metrics helper", () => {
  beforeEach(() => {
    resetMetrics();
  });

  describe("recordRequest", () => {
    it("records request metrics with correct properties", () => {
      recordRequest("/api/test", "GET", 200, 50);

      const metrics = getMetrics();

      expect(metrics.requests).toHaveLength(1);
      expect(metrics.requests[0]).toMatchObject({
        route: "/api/test",
        method: "GET",
        status: 200,
        count: 1,
      });
    });

    it("aggregates multiple requests to same key", () => {
      recordRequest("/api/test", "GET", 200, 50);
      recordRequest("/api/test", "GET", 200, 100);
      recordRequest("/api/test", "GET", 200, 75);

      const metrics = getMetrics();

      expect(metrics.requests).toHaveLength(1);
      expect(metrics.requests[0].count).toBe(3);
      expect(metrics.requests[0].durations).toEqual([50, 75, 100]);
    });

    it("separates metrics by status code", () => {
      recordRequest("/api/test", "GET", 200, 50);
      recordRequest("/api/test", "GET", 500, 100);

      const metrics = getMetrics();

      expect(metrics.requests).toHaveLength(2);
    });

    it("calculates percentiles correctly", () => {
      recordRequest("/api/test", "GET", 200, 10);
      recordRequest("/api/test", "GET", 200, 20);
      recordRequest("/api/test", "GET", 200, 30);
      recordRequest("/api/test", "GET", 200, 40);
      recordRequest("/api/test", "GET", 200, 50);
      recordRequest("/api/test", "GET", 200, 60);
      recordRequest("/api/test", "GET", 200, 70);
      recordRequest("/api/test", "GET", 200, 80);
      recordRequest("/api/test", "GET", 200, 90);
      recordRequest("/api/test", "GET", 200, 100);

      const metrics = getMetrics();

      expect(metrics.requests[0].percentiles.p50).toBe(50);
      expect(metrics.requests[0].percentiles.p95).toBe(90);
      expect(metrics.requests[0].percentiles.p99).toBe(90);
    });

    it("tracks duration buckets", () => {
      recordRequest("/api/test", "GET", 200, 25);
      recordRequest("/api/test", "GET", 200, 75);

      const metrics = getMetrics();

      expect(metrics.requests[0].buckets["10"]).toBeUndefined();
      expect(metrics.requests[0].buckets["50"]).toBe(1);
      expect(metrics.requests[0].buckets["100"]).toBe(1);
    });
  });

  describe("recordError", () => {
    it("records error metrics", () => {
      recordError("/api/test", "NetworkError");

      const metrics = getMetrics();

      expect(metrics.errors).toHaveLength(1);
      expect(metrics.errors[0]).toMatchObject({
        route: "/api/test",
        errorType: "NetworkError",
        count: 1,
      });
    });

    it("aggregates multiple errors of same type", () => {
      recordError("/api/test", "NetworkError");
      recordError("/api/test", "NetworkError");
      recordError("/api/test", "NetworkError");

      const metrics = getMetrics();

      expect(metrics.errors).toHaveLength(1);
      expect(metrics.errors[0].count).toBe(3);
    });
  });

  describe("getMetrics", () => {
    it("returns timestamp in ISO format", () => {
      const metrics = getMetrics();

      expect(metrics.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("returns empty arrays when no metrics recorded", () => {
      const metrics = getMetrics();

      expect(metrics.requests).toHaveLength(0);
      expect(metrics.errors).toHaveLength(0);
    });
  });

  describe("resetMetrics", () => {
    it("clears all recorded metrics", () => {
      recordRequest("/api/test", "GET", 200, 50);
      recordError("/api/test", "NetworkError");

      resetMetrics();

      const metrics = getMetrics();
      expect(metrics.requests).toHaveLength(0);
      expect(metrics.errors).toHaveLength(0);
    });
  });

  describe("withMetrics", () => {
    it("wraps handler and records request metrics on success", async () => {
      const mockHandler = jest.fn().mockImplementation(() => {
        return Promise.resolve();
      });

      const wrappedHandler = withMetrics(mockHandler);

      const mockReq = { method: "POST", url: "/api/test" };
      const mockRes = { statusCode: 201 };

      await wrappedHandler(mockReq, mockRes);

      expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);

      const metrics = getMetrics();
      expect(metrics.requests).toHaveLength(1);
      expect(metrics.requests[0].method).toBe("POST");
      expect(metrics.requests[0].status).toBe(201);
    });

    it("wraps handler and records error metrics on failure", async () => {
      const error = new Error("Test error");
      error.name = "TestError";

      const mockHandler = jest.fn().mockRejectedValue(error);

      const wrappedHandler = withMetrics(mockHandler);

      const mockReq = { method: "GET", url: "/api/test" };
      const mockRes = { statusCode: 500 };

      await expect(wrappedHandler(mockReq, mockRes)).rejects.toThrow(
        "Test error",
      );

      const metrics = getMetrics();
      expect(metrics.requests).toHaveLength(1);
      expect(metrics.requests[0].status).toBe(500);
      expect(metrics.errors).toHaveLength(1);
      expect(metrics.errors[0].errorType).toBe("TestError");
    });

    it("handles missing req/res properties gracefully", async () => {
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      const wrappedHandler = withMetrics(mockHandler);

      await wrappedHandler({}, {});

      const metrics = getMetrics();
      expect(metrics.requests).toHaveLength(1);
      expect(metrics.requests[0].method).toBe("UNKNOWN");
    });
  });
});
