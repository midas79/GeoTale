const auth = {
  // Cek apakah user sudah login
  checkLoggedIn() {
    return Boolean(localStorage.getItem('token'));
  },

  // Cek apakah autentikasi dibutuhkan untuk path tertentu
  requireAuth(path) {
    const publicPaths = ['/login', '/register', '/about'];
    const isPublicPath = publicPaths.includes(path); // Menggunakan .includes() untuk memeriksa path

    // Jika belum login dan bukan path publik, arahkan ke login
    if (!this.checkLoggedIn() && !isPublicPath) {
      window.location.hash = '#/login';
      return false;
    }

    // Jika sudah login dan mencoba akses login atau register, arahkan ke halaman cerita
    if (this.checkLoggedIn() && (path === '/login' || path === '/register')) {
      window.location.hash = '#/stories';
      return false;
    }

    // Jika semua cek lolos, izinkan akses
    return true;
  },
};

export default auth;
