const CACHE_NAME = "shelf-life-pro-v1";
const CORE_ASSETS = [
  "https://vv0121318-source.github.io/shelf-life-app/",
  "https://vv0121318-source.github.io/shelf-life-app/index.html",
  "https://vv0121318-source.github.io/shelf-life-app/manifest.json",
  "https://vv0121318-source.github.io/shelf-life-app/icon-192.png",
  "https://vv0121318-source.github.io/shelf-life-app/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(CORE_ASSETS).catch(() => {
        // If any single asset fails to cache, don't block install entirely
      })
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: always try to get the latest version online.
// Only fall back to the cached copy if the network request fails
// (e.g. no signal, brief outage) — so people always see updates
// when they're online, and a working app when they're not.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
