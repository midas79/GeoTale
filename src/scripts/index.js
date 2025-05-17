// CSS imports
import '../styles/styles.css';
import Navbar from '../components/navbar';
import App from './pages/app';
import '../styles/styles.css';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  Navbar.init();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/sw.bundle.js')
      .then(function (registration) {
        console.log('ServiceWorker registered:', registration);

        // Push Notification permission
        Notification.requestPermission().then(function (permission) {
          if (permission === 'granted') {
            console.log('Notification permission granted.');
          } else {
            console.log('Notification permission denied.');
          }
        });
      })
      .catch(function (error) {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}
