import React from "react";
import { render, waitFor } from "@testing-library/react";
import PwaRegister from "../PwaRegister";

describe("PwaRegister", () => {
  const originalEnv = process.env.NODE_ENV;

  const defineNavigatorServiceWorker = (serviceWorker) => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: serviceWorker,
      configurable: true,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();

    defineNavigatorServiceWorker(undefined);
    delete window.caches;
    delete global.caches;
    delete window.serwist;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("cleans old SW/caches and registers /sw.js in production", async () => {
    process.env.NODE_ENV = "production";

    const unregisterOld = jest.fn().mockResolvedValue(true);
    const unregisterKeep = jest.fn().mockResolvedValue(true);

    defineNavigatorServiceWorker({
      getRegistrations: jest.fn().mockResolvedValue([
        {
          active: { scriptURL: "https://example.com/sw.js" },
          unregister: unregisterKeep,
        },
        {
          active: { scriptURL: "https://example.com/workbox-abc.js" },
          unregister: unregisterOld,
        },
      ]),
      register: jest.fn().mockResolvedValue({ update: jest.fn() }),
    });

    global.caches = {
      keys: jest
        .fn()
        .mockResolvedValue(["workbox-precache-v2", "serwist-precache"]),
      delete: jest.fn().mockResolvedValue(true),
    };
    window.caches = global.caches;

    render(<PwaRegister />);

    await waitFor(() => {
      expect(navigator.serviceWorker.getRegistrations).toHaveBeenCalledTimes(1);
    });

    expect(unregisterOld).toHaveBeenCalledTimes(1);
    expect(unregisterKeep).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(global.caches.keys).toHaveBeenCalledTimes(1);
    });

    expect(global.caches.delete).toHaveBeenCalledTimes(1);
    expect(global.caches.delete).toHaveBeenCalledWith("workbox-precache-v2");

    await waitFor(() => {
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js", {
        scope: "/",
      });
    });
  });
  it("does nothing outside production", async () => {
    process.env.NODE_ENV = "test";

    defineNavigatorServiceWorker({
      getRegistrations: jest.fn(),
      register: jest.fn(),
    });

    render(<PwaRegister />);

    await new Promise((r) => setTimeout(r, 0));

    expect(navigator.serviceWorker.getRegistrations).not.toHaveBeenCalled();
    expect(navigator.serviceWorker.register).not.toHaveBeenCalled();
  });

  it("uses window.serwist.register when available", async () => {
    process.env.NODE_ENV = "production";

    window.serwist = { register: jest.fn().mockResolvedValue(undefined) };

    defineNavigatorServiceWorker({
      getRegistrations: jest.fn().mockResolvedValue([]),
      register: jest.fn(),
    });

    render(<PwaRegister />);

    await waitFor(() => {
      expect(window.serwist.register).toHaveBeenCalledTimes(1);
    });
    expect(navigator.serviceWorker.register).not.toHaveBeenCalled();
  });
});
