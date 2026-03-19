import { createMocks } from "node-mocks-http";

describe("legacy IP endpoints", () => {
  it("/api/ip returns 410 for GET and 405 for invalid methods", async () => {
    const handler = require("../../pages/api/ip").default;

    const get = createMocks({ method: "GET" });
    await handler(get.req, get.res);
    expect(get.res._getStatusCode()).toBe(410);
    expect(JSON.parse(get.res._getData()).error).toBe("Endpoint retired");

    const post = createMocks({ method: "POST" });
    await handler(post.req, post.res);
    expect(post.res._getStatusCode()).toBe(405);
  });

  it("/api/getIp returns 410 for GET and 405 for invalid methods", async () => {
    const handler = require("../../pages/api/getIp").default;

    const get = createMocks({ method: "GET" });
    await handler(get.req, get.res);
    expect(get.res._getStatusCode()).toBe(410);
    expect(JSON.parse(get.res._getData()).error).toBe("Endpoint retired");

    const post = createMocks({ method: "POST" });
    await handler(post.req, post.res);
    expect(post.res._getStatusCode()).toBe(405);
  });

  it("/api/postIp returns 410 for POST and 405 for invalid methods", async () => {
    const handler = require("../../pages/api/postIp").default;

    const post = createMocks({ method: "POST", body: { ip: "1.2.3.4" } });
    await handler(post.req, post.res);
    expect(post.res._getStatusCode()).toBe(410);
    expect(JSON.parse(post.res._getData()).error).toBe("Endpoint retired");

    const get = createMocks({ method: "GET" });
    await handler(get.req, get.res);
    expect(get.res._getStatusCode()).toBe(405);
  });
});
