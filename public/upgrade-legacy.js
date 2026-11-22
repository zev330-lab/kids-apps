// The previous Pages shell registered its worker without an update listener.
// Let the next navigation use the new shell, even if an old tab stays open.
self.addEventListener("install", event => {
  const scope = self.registration.scope;
  event.waitUntil(caches.match(new URL("registerSW.js", scope), {
    cacheName: "workbox-precache-v2-" + scope,
    ignoreSearch: true,
  }).then(legacy => legacy && self.skipWaiting()));
});
