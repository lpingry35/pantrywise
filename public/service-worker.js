/**
 * ============================================================================
 * SERVICE WORKER - Makes app work offline
 * ============================================================================
 *
 * This file runs in the background and:
 * 1. Caches app files for offline use
 * 2. Serves cached files when offline
 * 3. Updates cache when new version deployed
 *
 * CACHE STRATEGY:
 * - App shell (HTML, CSS, JS): Cache first, update in background
 * - Firebase API calls: Network first, fall back to cache
 * - Images: Cache first (they don't change often)
 */

const CACHE_NAME = 'pantrywise-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// ============================================================================
// INSTALL EVENT - Fires when service worker first installed
// Downloads and caches app files
// ============================================================================
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// ============================================================================
// ACTIVATE EVENT - Fires when service worker activated
// Cleans up old caches from previous versions
// ============================================================================
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// ============================================================================
// FETCH EVENT - Intercepts all network requests
// Strategy: Network first for API, Cache first for static assets
// ============================================================================
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Firebase API calls - Try network first, fall back to cache
  if (request.url.includes('firebaseio.com') || request.url.includes('googleapis.com') || request.url.includes('firestore.googleapis.com')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone response before caching
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - Try cache first, fall back to network
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Found in cache, return it
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone and cache for next time
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });

          return response;
        });
      })
  );
});
