import { createMocks } from "node-mocks-http";
import jokeHandler from "@/pages/api/joke";

jest.mock("@/lib/apiClient", () => ({
  ...jest.requireActual("@/lib/apiClient"),
  withErrorHandling: (handler) => handler,
}));

describe("Joke API", () => {
  describe("GET /api/joke", () => {
    it("should return joke data on success", async () => {
      const mockJokeData = {
        category: "Programming",
        type: "twopart",
        setup: "Why do programmers prefer dark mode?",
        delivery: "Because light attracts bugs.",
        id: 123,
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJokeData),
      });

      const { req, res } = createMocks({ method: "GET" });

      await jokeHandler(req, res);

      expect(res._getStatusCode()).toBe(200);

      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty("joke");
      expect(data).toHaveProperty("category", "Programming");
      expect(data).toHaveProperty("type", "twopart");
      expect(data).toHaveProperty("id", 123);
      expect(data.joke).toBe(
        "Why do programmers prefer dark mode? Because light attracts bugs.",
      );
    });

    it("should handle single-part jokes", async () => {
      const mockJokeData = {
        category: "Programming",
        type: "single",
        joke: "A SQL query walks into a bar, walks up to two tables and asks... can I join you?",
        id: 456,
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJokeData),
      });

      const { req, res } = createMocks({ method: "GET" });

      await jokeHandler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.joke).toBe(mockJokeData.joke);
    });

    it("should throw error when external API fails", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { req, res } = createMocks({ method: "GET" });

      await expect(jokeHandler(req, res)).rejects.toThrow(
        "Joke API failed with status 500",
      );
    });
  });
});
