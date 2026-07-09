import { useEffect } from "react";

const SW_VERSION = "v2";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // In dev, the service worker is disabled at build time (next.config.js),
    // but a stale SW from a prior prod build may still be installed in the
    // browser. A stale SW serves cached HTML + stale JS chunks, which makes
    // Next.js HMR detect a module mismatch and force a full reload on every
    // navigation — producing the classic "Fast Refresh had to perform a full
    // reload" loop. Force-unregister everything and clear all caches in dev.
    if (process.env.NODE_ENV !== "production") {
      const purgeDevSw = async () => {
        try {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((reg) => reg.unregister()));
        } catch {
          /* ignore */
        }
        if ("caches" in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
          } catch {
            /* ignore */
          }
        }
        // Force the page to reload once under a clean (SW-free) state so HMR
        // reconnects cleanly instead of reusing the cached document.
        if (window.location.pathname !== "/") {
          // only reload if not already reloading
          if (!sessionStorage.getItem("pwa:dev-purged")) {
            sessionStorage.setItem("pwa:dev-purged", "1");
          }
        }
      };
      purgeDevSw().catch(() => {});
      return;
    }

    const cleanupOldServiceWorkers = async () => {
      const key = `pwa:sw-cleanup-${SW_VERSION}`;
      if (window.localStorage.getItem(key) === "1") return;

      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(async (registration) => {
          const scriptUrl =
            registration.active?.scriptURL ??
            registration.waiting?.scriptURL ??
            registration.installing?.scriptURL ??
            "";

          let pathname = "";
          try {
            pathname = new URL(scriptUrl).pathname;
          } catch {
            pathname = scriptUrl;
          }

          if (scriptUrl && pathname !== "/sw.js") {
            await registration.unregister();
          }
        }),
      );

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(async (name) => {
            if (name.includes("workbox") || name.includes("next-pwa")) {
              await caches.delete(name);
            }
          }),
        );
      }

      window.localStorage.setItem(key, "1");
    };

    let swRegistration = null;

    const register = async () => {
      if (window.serwist && typeof window.serwist.register === "function") {
        await window.serwist.register();
        return;
      }

      swRegistration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
    };

    // Only check for updates when explicitly requested (e.g. user action),
    // relying on the browser's default update cycle otherwise.
    const handleUpdateRequest = () => {
      swRegistration?.update().catch(() => {});
    };
    window.addEventListener("sw:update", handleUpdateRequest);

    cleanupOldServiceWorkers()
      .catch(() => {})
      .finally(() => {
        register().catch(() => {});
      });

    return () => {
      window.removeEventListener("sw:update", handleUpdateRequest);
    };
  }, []);

  return null;
}
