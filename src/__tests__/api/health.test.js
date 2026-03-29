import { createMocks } from "node-mocks-http";
import healthHandler from "@/pages/api/health";

jest.mock("@/lib/apiClient", () => ({
  ...jest.requireActual("@/lib/apiClient"),
  withErrorHandling: (handler) => handler,
}));

describe("Health Check API", () => {
  describe("GET /api/health", () => {
    it("should return healthy status with timestamp", async () => {
      const { req, res } = createMocks({ method: "GET" });

      await healthHandler(req, res);

      expect(res._getStatusCode()).toBe(200);

      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty("status", "healthy");
      expect(data).toHaveProperty("timestamp");
      expect(typeof data.timestamp).toBe("number");
    });
  });

  describe("Method validation", () => {
    it("should return 405 for POST method", async () => {
      const { req, res } = createMocks({ method: "POST" });

      await healthHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader("Allow")).toBe("GET");

      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty("error", "Method Not Allowed");
    });

    it("should return 405 for PUT method", async () => {
      const { req, res } = createMocks({ method: "PUT" });

      await healthHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it("should return 405 for DELETE method", async () => {
      const { req, res } = createMocks({ method: "DELETE" });

      await healthHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });
});
