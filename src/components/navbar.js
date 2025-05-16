import auth from '../scripts/utils/middleware';
import NotificationHelper from '../scripts/utils/notificationHelper';

class Navbar {
  static init() {
    this._updateNavigation();
    window.addEventListener('hashchange', () => {
      this._updateNavigation();
    });
  }

  static async _updateNavigation() {
    const navList = document.getElementById('nav-list');
    const isLoggedIn = auth.checkLoggedIn();
    const isPushSupported = await NotificationHelper.isPushNotificationSupported();

    navList.innerHTML = `
      <ul class="nav-list">
      ${
        isLoggedIn
          ? `
        <li><a href="#/stories"><i class="fas fa-book"></i> Stories</a></li>
        <li><a href="#/stories/add"><i class="fas fa-plus"></i> Add Story</a></li>
        <li><a href="#/about"><i class="fas fa-info-circle"></i> About</a></li>
        ${
          isPushSupported
            ? `<li><a href="#" id="notificationButton" disabled><i class="fas fa-bell"></i> Notification</a></li>`
            : ''
        }
        <li><a href="#" id="logoutButton"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
      `
          : `
        <li><a href="#/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
        <li><a href="#/register"><i class="fas fa-user-plus"></i> Register</a></li>
        <li><a href="#/about"><i class="fas fa-info-circle"></i> About</a></li>
      `
      }
      </ul>
    `;

    if (isLoggedIn) {
      const logoutButton = document.getElementById('logoutButton');
      logoutButton.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.hash = '#/login';
      });

      // Handle notification subscription button if supported
      if (isPushSupported) {
        const notificationButton = document.getElementById('notificationButton');

        // Update button UI based on subscription status
        await NotificationHelper.updateSubscriptionButton(notificationButton);

        // Add event listener for notification button
        notificationButton.addEventListener('click', async e => {
          e.preventDefault();
          notificationButton.disabled = true;

          try {
            const isSubscribed = await NotificationHelper.isSubscribed();

            if (isSubscribed) {
              // If already subscribed, unsubscribe
              await NotificationHelper.unsubscribe();
              this._showToast('Notifikasi telah dinonaktifkan');
            } else {
              // If not subscribed, subscribe
              await NotificationHelper.subscribe();
              this._showToast('Notifikasi telah diaktifkan');
            }

            // Update button UI after subscription change
            await NotificationHelper.updateSubscriptionButton(notificationButton);
          } catch (error) {
            console.error('Notification subscription error:', error);
            this._showToast(`Error: ${error.message}`);
          } finally {
            notificationButton.disabled = false;
          }
        });
      }
    }
  }

  static _showToast(message) {
    // Simple toast notification (you might want to replace this with your app's toast system)
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }, 100);
  }

  static _checkLoggedIn() {
    return !!localStorage.getItem('token'); // Check if a token exists in localStorage
  }

  static _loggedInMenu() {
    return `
        <li><a href="#/stories"><i class="fas fa-book"></i> Stories</a></li>
        <li><a href="#/stories/add"><i class="fas fa-plus"></i> Add Story</a></li>
        <li><a href="#/about"><i class="fas fa-info-circle"></i> About</a></li>
        <li><a href="#" id="logoutButton"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
      `;
  }

  static _loggedOutMenu() {
    return `
        <li><a href="#/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
        <li><a href="#/register"><i class="fas fa-user-plus"></i> Register</a></li>
        <li><a href="#/about"><i class="fas fa-info-circle"></i> About</a></li>
      `;
  }

  static _logout() {
    localStorage.removeItem('token'); // Remove the token from localStorage
    window.location.hash = '#/login'; // Redirect to the login page
  }
}

export default Navbar;
