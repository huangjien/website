describe("rateLimit", () => {
  const originalSetInterval = global.setInterval;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    global.setInterval = jest.fn();
  });

  afterEach(() => {
    global.setInterval = originalSetInterval;
    jest.restoreAllMocks();
  });

  it("allows up to the limit and then blocks within the window", () => {
    jest.isolateModules(() => {
      const { checkRateLimit } = require("../rateLimit");

      let now = 1_000_000;
      jest.spyOn(Date, "now").mockImplementation(() => now);

      const first = checkRateLimit("ip-1", 2, 1000);
      expect(first.allowed).toBe(true);
      expect(first.remaining).toBe(1);
      expect(first.resetAt).toBe(now + 1000);

      now += 10;
      const second = checkRateLimit("ip-1", 2, 1000);
      expect(second.allowed).toBe(true);
      expect(second.remaining).toBe(0);
      expect(second.resetAt).toBe(now + 1000);

      now += 10;
      const third = checkRateLimit("ip-1", 2, 1000);
      expect(third.allowed).toBe(false);
      expect(third.remaining).toBe(0);
      expect(third.resetAt).toBe(1_000_000 + 1000);
    });
  });

  it("expires old requests after the window and allows again", () => {
    jest.isolateModules(() => {
      const { checkRateLimit } = require("../rateLimit");

      let now = 2_000_000;
      jest.spyOn(Date, "now").mockImplementation(() => now);

      expect(checkRateLimit("ip-2", 1, 1000).allowed).toBe(true);

      now += 10;
      expect(checkRateLimit("ip-2", 1, 1000).allowed).toBe(false);

      now += 1001;
      const afterWindow = checkRateLimit("ip-2", 1, 1000);
      expect(afterWindow.allowed).toBe(true);
      expect(afterWindow.remaining).toBe(0);
    });
  });

  it("cleanup deletes identifiers with no recent requests", () => {
    jest.isolateModules(() => {
      const { checkRateLimit, cleanupRateLimitMap } = require("../rateLimit");

      let now = 3_000_000;
      jest.spyOn(Date, "now").mockImplementation(() => now);

      const deleteSpy = jest.spyOn(Map.prototype, "delete");

      checkRateLimit("ip-3", 10, 60_000);

      now += 120_000;
      cleanupRateLimitMap();

      expect(deleteSpy).toHaveBeenCalledWith("ip-3");
    });
  });
});
