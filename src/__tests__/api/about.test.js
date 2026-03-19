import { createMocks } from "node-mocks-http";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout";

jest.mock("../../lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

describe("/api/about", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and content on success", async () => {
    fetchWithTimeout.mockResolvedValueOnce({
      ok: true,
      text: async () => "# About",
    });

    const handler = require("../../pages/api/about").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toBe("# About");
  });

  it("returns upstream status when response is not ok", async () => {
    fetchWithTimeout.mockResolvedValueOnce({
      ok: false,
      status: 502,
    });

    const handler = require("../../pages/api/about").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(502);
    expect(JSON.parse(res._getData()).error).toBe(
      "Failed to load about content",
    );
  });

  it("returns 504 on timeout errors", async () => {
    const timeoutError = new Error("timeout");
    timeoutError.name = "AbortError";
    fetchWithTimeout.mockRejectedValueOnce(timeoutError);

    const handler = require("../../pages/api/about").default;
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(504);
    expect(JSON.parse(res._getData()).error).toBe("Upstream request timed out");
  });
});
