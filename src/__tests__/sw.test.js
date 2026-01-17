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

  it("filters out dynamic-css-manifest.json from precache entries", () => {
    global.self = {
      __SW_MANIFEST: [
        { url: "/_next/dynamic-css-manifest.json" },
        { url: "/favicon.ico" },
        "/_next/dynamic-css-manifest.json",
        "/manifest.json",
      ],
    };

    require("../sw");

    expect(mockInstallSerwist).toHaveBeenCalledTimes(1);
    const options = mockInstallSerwist.mock.calls[0][0];

    expect(options.precacheEntries).toEqual([
      { url: "/favicon.ico" },
      "/manifest.json",
    ]);
  });
});
