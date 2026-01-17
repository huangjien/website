import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.serwist !== undefined
    ) {
      // Check if we are in browser environment and if service worker is supported
      // We import dynamically to avoid SSR issues
      import("@serwist/window").then(({ Serwist }) => {
        const serwist = new Serwist("/sw.js", { scope: "/", type: "classic" });
        serwist.register();
      });
    }
  }, []);

  return null;
}
