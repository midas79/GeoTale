// src/scripts/index.js
// CSS imports
import '../styles/styles.css';
import Navbar from '../components/navbar';
import App from './pages/app';
import OfflineNotice from '../components/offlineNotice';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize offline notice
  const offlineNotice = new OfflineNotice();

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // Setup online/offline detection
  window.addEventListener('online', () => {
    document.dispatchEvent(
      new CustomEvent('app-status', {
        detail: { isOnline: true },
      })
    );
  });

  window.addEventListener('offline', () => {
    document.dispatchEvent(
      new CustomEvent('app-status', {
        detail: { isOnline: false },
      })
    );
  });

  Navbar.init();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async function () {
    try {
      // Determine the correct path for the service worker
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      const basePath = isLocalhost ? '/' : '/GeoTale/';
      const swPath = `${basePath}sw.bundle.js`;

      const registration = await navigator.serviceWorker.register(swPath);
      console.log('ServiceWorker registered:', registration);

      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log(`Notification permission ${permission}.`);
      }
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });
}
