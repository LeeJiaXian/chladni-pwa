/**
 * Chladni-PWA Service Worker (v1)
 * Strategy: Cache-First with Background Update + Clean Redirect Sanitization
 */
const CACHE_NAME = 'chladni-pwa-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

/**
 * Rebuilds a clean Response when `response.redirected` is true so Safari / Chromium
 * will never fail when serving cached navigation responses offline.
 */
function sanitizeResponse(res) {
  if (!res || !res.redirected) {
    return res;
  }
  const cleanHeaders = new Headers(res.headers);
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: cleanHeaders,
  });
}

/**
 * Determines whether a request is safe and lightweight to store in the PWA cache.
 * Excludes local audio blob URLs, range requests, and non-HTTP(S) schemes.
 */
function isCacheableRequest(request) {
  if (request.method !== 'GET') return false;
  if (request.headers.has('range')) return false;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

  // Never cache large media files to keep total storage well under 50 MB
  if (request.destination === 'audio' || request.destination === 'video') {
    return false;
  }
  return true;
}

// 1. Install: Pre-cache core shell assets (sanitizing any redirected responses)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        PRECACHE_URLS.map(async (assetUrl) => {
          try {
            const response = await fetch(assetUrl, { cache: 'no-cache' });
            if (response && response.ok) {
              const clean = sanitizeResponse(response);
              await cache.put(assetUrl, clean);
            }
          } catch (_) {
            // Skip individual missing assets during dev without blocking install
          }
        })
      );
    })
  );
  self.skipWaiting();
});

// 2. Activate: Purge outdated cache versions & take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    )
  );
  self.clients.claim();
});

// 3. Fetch: Cache-First with Background Update + Offline Navigation Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isCacheableRequest(request)) return;

  // Handle page navigations (e.g. launching standalone PWA offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedNav =
          (await cache.match(request, { ignoreSearch: true })) ||
          (await cache.match('./index.html'));

        const networkFetch = fetch(request)
          .then((netRes) => {
            if (netRes && netRes.ok) {
              const cleanForCache = sanitizeResponse(netRes.clone());
              cache.put('./index.html', cleanForCache);
              return sanitizeResponse(netRes);
            }
            return netRes;
          })
          .catch(() => null);

        if (cachedNav) {
          event.waitUntil(networkFetch);
          return cachedNav;
        }

        const fresh = await networkFetch;
        if (fresh) return fresh;

        return new Response('目前處於離線狀態且尚未快取主頁面。', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
    );
    return;
  }

  // Handle static assets: Cache-First + silent background refresh
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      const backgroundUpdate = fetch(request)
        .then((netRes) => {
          if (netRes && (netRes.ok || netRes.type === 'opaque')) {
            const cleanRes = netRes.type === 'opaque' ? netRes.clone() : sanitizeResponse(netRes.clone());
            cache.put(request, cleanRes);
          }
          return netRes;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(backgroundUpdate);
        return cached;
      }

      const fresh = await backgroundUpdate;
      return fresh || new Response('', { status: 504 });
    })
  );
});
