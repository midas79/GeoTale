// src/scripts/sw.js
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Determine BASE_PATH dynamically
const BASE_PATH = self.location.pathname.includes('/GeoTale/') ? '/GeoTale/' : '/';

// Precache manifest with careful handling
const manifestEntries = self.__WB_MANIFEST || [];

// Ensure we don't have duplicate entries for offline.html
const uniqueManifest = manifestEntries.filter((entry, index, self) => {
  // If this is a string entry, convert to object format
  const url = typeof entry === 'string' ? entry : entry.url;

  // Check if this URL contains offline.html
  if (url.includes('offline.html')) {
    // Only keep the first occurrence of offline.html
    return (
      self.findIndex(e => {
        const eUrl = typeof e === 'string' ? e : e.url;
        return eUrl.includes('offline.html');
      }) === index
    );
  }
  return true;
});

// Now precache the deduplicated manifest
precacheAndRoute(uniqueManifest);

// Constants for cache names and API
const API_URL = 'https://story-api.dicoding.dev/v1';
const CACHE_NAMES = {
  API: 'geotale-api-v1',
  IMAGES: 'geotale-images-v1',
  STATIC: 'geotale-static-v1',
  PAGES: 'geotale-pages-v1',
};

// Background sync for offline operations
const bgSyncPlugin = new BackgroundSyncPlugin('geotale-offline-queue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (in minutes)
});

// Safe URL origin matching helper
const matchesApiOrigin = url => {
  try {
    return new URL(url).origin === new URL(API_URL).origin;
  } catch (error) {
    console.error('SW: Invalid URL detected:', url, error);
    return false;
  }
};

// Set up navigation route handling
const appShellHandler = createHandlerBoundToURL(`${BASE_PATH}index.html`);
registerRoute(
  // Return false for URLs that shouldn't be handled by the app shell
  ({ request, url }) => {
    // Don't handle non-navigation requests
    if (request.mode !== 'navigate') return false;

    // Don't handle API requests or asset files
    if (
      url.pathname.startsWith('/api/') ||
      url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif)$/)
    ) {
      return false;
    }

    return true;
  },
  appShellHandler
);

// API data caching strategy (NetworkFirst)
registerRoute(
  ({ url, request }) => matchesApiOrigin(url.href) && request.destination !== 'image',
  new NetworkFirst({
    cacheName: CACHE_NAMES.API,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  })
);

// API images caching strategy (StaleWhileRevalidate)
registerRoute(
  ({ url, request }) => matchesApiOrigin(url.href) && request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.IMAGES,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
      }),
    ],
  })
);

// All other images (CacheFirst)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: CACHE_NAMES.IMAGES,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Static assets (StaleWhileRevalidate)
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.STATIC,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// POST requests with background sync
registerRoute(
  ({ url, request }) =>
    matchesApiOrigin(url.href) && (request.method === 'POST' || request.method === 'PUT'),
  async ({ request }) => {
    try {
      // Attempt the network request
      return await fetch(request.clone());
    } catch (error) {
      // If network fails, add to background sync queue
      await bgSyncPlugin.pushRequest({ request });

      // Return a response to the client
      return new Response(
        JSON.stringify({
          error: true,
          message: 'You are offline. Your request will be sent when you reconnect.',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        }
      );
    }
  }
);

// Handle offline fallback
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Next, try the network
          return await fetch(event.request);
        } catch (error) {
          // If both fail, show the offline page
          const offlineUrl = `${BASE_PATH}offline.html`;

          // First check the cache directly
          const cache = await caches.open('workbox-precache-v2');

          // Look for the offline page with any revision
          const cachedKeys = await cache.keys();
          const offlinePageKey = cachedKeys.find(key => key.url.includes('offline.html'));

          if (offlinePageKey) {
            return await cache.match(offlinePageKey);
          }

          // Fallback to a generic offline message if the page isn't cached
          return new Response(
            '<html><body><h1>You are offline</h1><p>Please check your connection.</p></body></html>',
            {
              headers: { 'Content-Type': 'text/html' },
              status: 503,
            }
          );
        }
      })()
    );
  }
});

// Handle push events (incoming notifications)
// In your service worker (sw.js)
self.addEventListener('push', event => {
  if (!event.data) return;

  let notification;
  try {
    notification = event.data.json();
  } catch (error) {
    notification = {
      title: 'New Notification',
      options: {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
      },
    };
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, {
      ...notification.options,
      badge: '/icons/badge-72x72.png',
      timestamp: Date.now(),
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // If a window client is already open, focus it
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(urlToOpen);
    })
  );
});

// Clean up old caches during activation
self.addEventListener('activate', event => {
  console.log('SW activated');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Check if this cache name isn't in our defined caches
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        // Claim clients so the service worker is in control without reload
        return self.clients.claim();
      })
  );
});

// Background sync event handler
self.addEventListener('sync', event => {
  if (event.tag === 'geotale-offline-queue') {
    console.log('Background sync triggered');
    // The BackgroundSyncPlugin will handle the replaying of queued requests
  }
});
