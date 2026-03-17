import { fetchWithTimeout, parseErrorResponse } from "../fetchWithTimeout";

describe("fetchWithTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("passes AbortController signal and request options to fetch", async () => {
    await fetchWithTimeout(
      "/api/test",
      { method: "POST", headers: { "x-test": "1" } },
      5000,
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/test");
    expect(options.method).toBe("POST");
    expect(options.headers["x-test"]).toBe("1");
    expect(options.signal).toBeDefined();
    expect(typeof options.signal.aborted).toBe("boolean");
  });

  it("aborts the request when timeout is reached", async () => {
    let capturedSignal;
    global.fetch.mockImplementation(
      (_url, options) =>
        new Promise(() => {
          capturedSignal = options.signal;
        }),
    );

    fetchWithTimeout("/api/slow", {}, 10);
    expect(capturedSignal?.aborted).toBe(false);

    jest.advanceTimersByTime(11);
    expect(capturedSignal?.aborted).toBe(true);
  });

  it("clears timeout when request finishes", async () => {
    const clearSpy = jest.spyOn(global, "clearTimeout");
    await fetchWithTimeout("/api/fast", {}, 100);
    expect(clearSpy).toHaveBeenCalled();
  });
});

describe("parseErrorResponse", () => {
  it("returns fallback message for empty response text", async () => {
    const message = await parseErrorResponse({
      status: 418,
      text: async () => "",
    });
    expect(message).toBe("Request failed with status 418");
  });

  it("prefers json.message from response body", async () => {
    const message = await parseErrorResponse({
      status: 400,
      text: async () => JSON.stringify({ message: "bad request" }),
    });
    expect(message).toBe("bad request");
  });

  it("falls back to json.error from response body", async () => {
    const message = await parseErrorResponse({
      status: 500,
      text: async () => JSON.stringify({ error: "upstream error" }),
    });
    expect(message).toBe("upstream error");
  });

  it("returns plain text when body is not json", async () => {
    const message = await parseErrorResponse({
      status: 502,
      text: async () => "gateway error",
    });
    expect(message).toBe("gateway error");
  });

  it("returns fallback message when reading body throws", async () => {
    const message = await parseErrorResponse({
      status: 503,
      text: async () => {
        throw new Error("stream closed");
      },
    });
    expect(message).toBe("Request failed with status 503");
  });
});
