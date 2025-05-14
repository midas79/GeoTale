import LoginPresenter from './login-presenter';
import Swal from 'sweetalert2';

class LoginPage {
  #presenter = null;

  constructor() {
    this.#presenter = new LoginPresenter(this);
  }

  async render() {
    return `
      <section class="auth">
        <h1 class="auth__title">Login</h1>

        <form class="auth__form" id="loginForm">
          <div class="form-group">
            <label for="email">
              <i class="fas fa-envelope"></i> Email
            </label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required autocomplete="email">
          </div>

          <div class="form-group">
            <label for="password">
              <i class="fas fa-lock"></i> Password
            </label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required autocomplete="current-password">
          </div>

          <button type="submit" class="submit-button">
            <i class="fas fa-sign-in-alt"></i> Login
          </button>
        </form>

        <p class="auth__link">
          Don’t have an account? <a href="#/register">Register</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#loginForm');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');

    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Clear previous warnings
      form.querySelectorAll('.error-message').forEach(el => el.remove());

      let isValid = true;

      // Validate email
      if (!emailInput.value.includes('@') || !emailInput.value.includes('.')) {
        isValid = false;
        showError(emailInput, 'Please enter a valid email address.');
      }

      // Validate password
      if (passwordInput.value.length < 6) {
        isValid = false;
        showError(passwordInput, 'Password must be at least 6 characters long.');
      }

      if (!isValid) return;

      form.classList.add('loading');

      const formData = new FormData(form);
      const response = await this.#presenter.login(formData);

      form.classList.remove('loading');

      if (response.error) {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: response.message,
        });
      } else {
        localStorage.setItem('token', response.loginResult.token);

        await Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'You will be redirected to the main page',
          timer: 1500,
          showConfirmButton: false,
        });

        window.location.hash = '#/';
      }
    });

    function showError(input, message) {
      const error = document.createElement('p');
      error.className = 'error-message';
      error.textContent = message;
      input.parentElement.appendChild(error);
    }
  }
}

export default LoginPage;
