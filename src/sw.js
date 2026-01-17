import { defaultCache } from "@serwist/next/worker";
import { installSerwist } from "@serwist/sw";

const precacheEntries = (self.__SW_MANIFEST || []).filter((entry) => {
  const url = typeof entry === "string" ? entry : entry?.url;
  return !url || !url.includes("/_next/dynamic-css-manifest.json");
});

installSerwist({
  precacheEntries,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});
