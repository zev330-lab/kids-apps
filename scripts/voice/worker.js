// coreClips and storyClips are supplied by the build, relative to this scope.
const voiceScope = self.registration.scope;
const storyCacheName = "playtime-stories-" + voiceScope;
const stories = new Set(storyClips.map(path => new URL(path, voiceScope).href));

async function coreResponse(request, [pack, start, end]) {
  const packed = await caches.match(new URL(pack, voiceScope), {
    cacheName: "workbox-precache-v2-" + voiceScope,
    ignoreSearch: true,
  });
  if (!packed) return fetch(request);
  return new Response((await packed.blob()).slice(start, end), { headers: { "Content-Type": "audio/mp4" } });
}

async function storyResponse(cache, url) {
  const stored = await cache.match(url);
  if (stored) return stored;
  const response = await fetch(url);
  if (response.ok) {
    try {
      await cache.put(url, response.clone());
    } catch {
      // The downloaded audio can still play when offline storage is full.
    }
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(voiceScope)) return;
  const path = request.url.slice(voiceScope.length);
  if (Object.hasOwn(coreClips, path)) {
    event.respondWith(coreResponse(request, coreClips[path]));
  } else if (stories.has(request.url)) {
    event.respondWith(caches.open(storyCacheName).then(cache => storyResponse(cache, request.url)));
  }
});

let warming;
async function pruneStories(cache) {
  const obsolete = (await cache.keys()).filter(request => !stories.has(request.url));
  await Promise.all(obsolete.map(request => cache.delete(request)));
}

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.open(storyCacheName).then(pruneStories).catch(() => {}));
});

async function warmStories() {
  const cache = await caches.open(storyCacheName);
  await pruneStories(cache);
  for (const url of stories) {
    await storyResponse(cache, url);
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "WARM_STORIES") return;
  // This message goes to the active worker. Installation and activation never
  // wait for story downloads. A later online visit resumes at the cache misses.
  warming ??= warmStories().catch(() => {}).finally(() => { warming = undefined; });
  event.waitUntil(warming);
});
