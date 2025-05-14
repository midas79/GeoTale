class Navbar {
  static init() {
    this._updateNavigation();
    window.addEventListener('hashchange', () => {
      this._updateNavigation();
    });
  }

  static _updateNavigation() {
    const navList = document.getElementById('nav-list');
    const isLoggedIn = this._checkLoggedIn();

    navList.innerHTML = `
        ${isLoggedIn ? this._loggedInMenu() : this._loggedOutMenu()}
      `;

    if (isLoggedIn) {
      const logoutButton = document.getElementById('logoutButton');
      logoutButton.addEventListener('click', e => {
        e.preventDefault();
        this._logout();
      });
    }
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
