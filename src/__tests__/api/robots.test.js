import handler from "../../pages/api/robots";
import { createMocks } from "node-mocks-http";

describe("/api/robots", () => {
  it("returns robots content for GET", async () => {
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(res._getData()).toContain("User-agent: *");
  });

  it("returns 405 for non-GET methods", async () => {
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader("Allow")).toBe("GET");
    expect(JSON.parse(res._getData())).toEqual({
      error: "Method Not Allowed",
    });
  });
});
