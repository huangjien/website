const mockInstallSerwist = jest.fn();

jest.mock("@serwist/sw", () => ({
  installSerwist: (...args) => mockInstallSerwist(...args),
}));

jest.mock("@serwist/next/worker", () => ({
  defaultCache: "defaultCache",
}));

describe("sw", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("passes manifest to installSerwist with correct options", () => {
    const testManifest = [
      { url: "/favicon.ico" },
      "/manifest.json",
      { url: "/_next/static/chunks/main.js" },
    ];
    global.self = {
      __SW_MANIFEST: testManifest,
    };

    require("../sw");

    expect(mockInstallSerwist).toHaveBeenCalledTimes(1);
    const options = mockInstallSerwist.mock.calls[0][0];

    expect(options.precacheEntries).toBe(testManifest);
    expect(options.skipWaiting).toBe(true);
    expect(options.clientsClaim).toBe(true);
    expect(options.navigationPreload).toBe(true);
    expect(options.runtimeCaching).toBe("defaultCache");
  });
});
