import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache manifest (inject by Workbox)
precacheAndRoute(self.__WB_MANIFEST || []);

// Constants
const BASE_URL = 'https://story-api.dicoding.dev/v1';

// Helper untuk handle URL yang aman
const safeUrlOriginMatch = (urlString, compareOrigin) => {
  try {
    return new URL(urlString).origin === compareOrigin;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('SW: Invalid URL detected:', urlString, error);
    }
    return false;
  }
};

// API handler (exclude images)
registerRoute(
  ({ request }) =>
    safeUrlOriginMatch(request.url, new URL(BASE_URL).origin) && request.destination !== 'image',
  new NetworkFirst({
    cacheName: 'geotale-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Image handler
registerRoute(
  ({ request }) =>
    safeUrlOriginMatch(request.url, new URL(BASE_URL).origin) && request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'geotale-api-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 minggu
      }),
    ],
  })
);

// Generic Image cache (external images atau CDN)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'geotale-external-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// Offline fallback page (optional kalau SPA)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await new NetworkFirst({
        cacheName: 'geotale-html',
      }).handle({ event });
    } catch (error) {
      return caches.match('/offline.html');
    }
  }
);

self.addEventListener('install', event => {
  console.log('SW installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('SW activated');
  self.clients.claim();
});

// Handle push events (incoming notifications)
self.addEventListener('push', event => {
  console.log('Push notification received', event);

  let notificationData = {
    title: 'Story App',
    options: {
      body: 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {},
    },
  };

  if (event.data) {
    try {
      // Coba parse JSON
      const data = event.data.json();
      notificationData.title = data.title || notificationData.title;
      notificationData.options = {
        ...notificationData.options,
        ...(data.options || {}),
        data: data.data || {},
      };
    } catch (error) {
      // Fallback kalau bukan JSON, anggap plain text
      console.error('Error parsing push notification data, fallback to text:', error);
      notificationData.options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData.options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked', event);
  event.notification.close();

  const data = event.notification.data || {};
  const urlToOpen = data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
