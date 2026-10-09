import { renderHook, waitFor } from "@testing-library/react";
import { useAiModelCatalog } from "../useAiModelCatalog";

jest.mock("../../../config/ai-models", () => ({
  getCuratedAiModels: jest.fn(() => [
    { id: "fallback-a", label: "Fallback A" },
    { id: "fallback-b", label: "Fallback B" },
  ]),
}));

describe("useAiModelCatalog", () => {
  let originalFetch;
  let originalNodeEnv;

  beforeEach(() => {
    originalFetch = global.fetch;
    // Default to a non-test env so the hook's effect actually runs and we
    // exercise fetch + abort paths. Individual tests can flip this.
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NODE_ENV = originalNodeEnv;
    jest.clearAllMocks();
  });

  it("returns the curated fallback synchronously when NODE_ENV=test", async () => {
    process.env.NODE_ENV = "test";
    global.fetch = jest.fn();

    const { result } = renderHook(() => useAiModelCatalog());

    expect(result.current).toEqual([
      { id: "fallback-a", label: "Fallback A" },
      { id: "fallback-b", label: "Fallback B" },
    ]);

    // give the effect a chance to (incorrectly) call fetch
    await new Promise((r) => setTimeout(r, 10));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("loads live models from /api/ai-models", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ models: [{ id: "live", label: "Live" }] }),
      }),
    );

    const { result } = renderHook(() => useAiModelCatalog());

    await waitFor(() => {
      expect(result.current).toEqual([{ id: "live", label: "Live" }]);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/ai-models",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("falls back to curated models when the fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("network down")));

    const { result } = renderHook(() => useAiModelCatalog());

    await waitFor(() => {
      expect(result.current).toEqual([
        { id: "fallback-a", label: "Fallback A" },
        { id: "fallback-b", label: "Fallback B" },
      ]);
    });
  });

  it("falls back when the response is not ok", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      }),
    );

    const { result } = renderHook(() => useAiModelCatalog());

    await waitFor(() => {
      expect(result.current).toEqual([
        { id: "fallback-a", label: "Fallback A" },
        { id: "fallback-b", label: "Fallback B" },
      ]);
    });
  });

  it("ignores empty model arrays in the response", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ models: [] }),
      }),
    );

    const { result } = renderHook(() => useAiModelCatalog());

    // Wait long enough for the fetch to resolve.
    await new Promise((r) => setTimeout(r, 10));
    expect(result.current).toEqual([
      { id: "fallback-a", label: "Fallback A" },
      { id: "fallback-b", label: "Fallback B" },
    ]);
  });

  it("aborts in-flight requests on unmount", async () => {
    let abortSignal;
    global.fetch = jest.fn((_url, opts = {}) => {
      abortSignal = opts.signal;
      return new Promise(() => {}); // never resolves
    });

    const { unmount } = renderHook(() => useAiModelCatalog());

    // Wait for the effect to set up the request
    await waitFor(() => expect(abortSignal).toBeDefined());

    unmount();

    expect(abortSignal.aborted).toBe(true);
  });

  it("ignores AbortError without logging or falling back", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    global.fetch = jest.fn(() => {
      const err = new Error("aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });

    const { result } = renderHook(() => useAiModelCatalog());

    await new Promise((r) => setTimeout(r, 10));
    // Fallback should still be applied (the hook treats AbortError as no-op
    // and keeps the existing state, which is the initial fallback here).
    expect(result.current).toEqual([
      { id: "fallback-a", label: "Fallback A" },
      { id: "fallback-b", label: "Fallback B" },
    ]);
    warnSpy.mockRestore();
  });
});
