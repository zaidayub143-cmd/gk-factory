/* GK Factory — Service Worker (PWA) */
const CACHE = 'gk-factory-v1';
const CORE = [
  '/gk-factory/',
  '/gk-factory/index.html',
  '/gk-factory/manifest.json',
  '/gk-factory/icons/icon-192.png',
  '/gk-factory/icons/icon-512.png',
  '/gk-factory/icons/icon-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Same-origin: cache-first, fall back to network, then update cache
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        }).catch(() => caches.match('/gk-factory/index.html'));
      })
    );
    return;
  }

  // Cross-origin (e.g. Unsplash images): network-first, cache fallback
  event.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((cache) => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req))
  );
});