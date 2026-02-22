import { useEffect } from "react";

const SW_VERSION = "v2";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    if (process.env.NODE_ENV !== "production") return;

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

    const register = async () => {
      if (window.serwist && typeof window.serwist.register === "function") {
        await window.serwist.register();
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      await registration.update();
    };

    cleanupOldServiceWorkers()
      .catch(() => {})
      .finally(() => {
        register().catch(() => {});
      });
  }, []);

  return null;
}
