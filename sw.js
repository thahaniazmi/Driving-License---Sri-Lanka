// Sri Lanka Driving License Portal - Service Worker
// Version: 1.0.0
const CACHE_NAME = 'sldl-portal-v1';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/quiz.html',
  '/signs.html',
  '/questions.html',
  '/404.html',
  '/assets/css/style.css',
  '/assets/js/app.js',
  '/assets/js/quiz.js',
  '/assets/js/signs.js',
  '/assets/js/questions.js',
  '/assets/js/signs-data.js',
  '/assets/js/questions-data.js',
  '/favicon.svg',
  '/manifest.json'
];

// Install: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('Pre-cache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests from the same origin
  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Signs & static images: Cache-first with network fallback
  if (url.pathname.includes('/assets/signs/') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.png')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML Navigation: Network first, fall back to cached page or 404
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const cached404 = await caches.match('/404.html');
          return cached404 || new Response('Offline: Page not cached', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // CSS, JS, JSON: Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
