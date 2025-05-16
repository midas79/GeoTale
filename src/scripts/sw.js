// sw.js - Service Worker

self.addEventListener('install', event => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
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
