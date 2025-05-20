// src/components/OfflineNotice.js
class OfflineNotice {
  #container;
  #isInitialized = false;

  constructor() {
    this.#createNoticeElement();
    this.#initialize();
  }

  #createNoticeElement() {
    this.#container = document.createElement('div');
    this.#container.className = 'offline-notice';
    this.#container.setAttribute('role', 'alert');
    this.#container.setAttribute('aria-live', 'assertive');
    this.#container.innerHTML = `
      <div class="offline-notice__content">
        <span class="offline-notice__icon" aria-hidden="true">📶</span>
        <span class="offline-notice__text">You are currently offline. Some features may be limited.</span>
      </div>
    `;

    // Add styles if not already in your CSS
    if (!document.getElementById('offline-notice-styles')) {
      const style = document.createElement('style');
      style.id = 'offline-notice-styles';
      style.textContent = `
        .offline-notice {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px 20px;
          text-align: center;
          z-index: 9999;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          transform: translateY(100%);
          transition: transform 0.3s ease-in-out;
        }
        .offline-notice.visible {
          transform: translateY(0);
        }
        .offline-notice__content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .offline-notice__icon {
          font-size: 1.5rem;
        }
        .offline-notice__text {
          font-weight: 500;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(this.#container);
  }

  #initialize() {
    if (this.#isInitialized) return;

    // Initial check
    this.updateStatus();

    // Listen for custom app-status events
    document.addEventListener('app-status', event => {
      this.updateStatus(event.detail.isOnline);
    });

    // Also listen for native events
    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));

    this.#isInitialized = true;
  }

  updateStatus(isOnline = navigator.onLine) {
    if (isOnline) {
      this.#container.classList.remove('visible');
    } else {
      this.#container.classList.add('visible');
    }
  }
}

export default OfflineNotice;
