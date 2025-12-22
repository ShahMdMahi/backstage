const CACHE_NAME = "backstage";
const OFFLINE_URL = "/offline";

// Install event - cache the offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        "/manifest.json",
        "/manifest.webmanifest",
        "/favicon.ico",
        "/icons/*",
        "_next/static/*",
        "_next/image/*",
        "/sw.js",
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If the request is successful, cache it for future use
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If offline, try to serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache and it's a navigation request, serve offline page
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          // Otherwise, return a basic offline response
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});
