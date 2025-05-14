import RegisterPresenter from './register-presenter';

class RegisterPage {
  #presenter = null;

  constructor() {
    this.#presenter = new RegisterPresenter(this);
  }

  async render() {
    return `
<section class="auth container">
  <h1 class="auth__title"><i class="fas fa-user-plus"></i> Register</h1>
  
  <form id="registerForm" class="auth__form">
    <div class="form-group">
      <label for="name"><i class="fas fa-user"></i> Name</label>
      <input type="text" id="name" name="name" placeholder="Enter your name" required>
    </div>

    <div class="form-group">
      <label for="email"><i class="fas fa-envelope"></i> Email</label>
      <input type="email" id="email" name="email" placeholder="Enter your email" required>
    </div>
    
    <div class="form-group">
      <label for="password"><i class="fas fa-lock"></i> Password</label>
      <input 
        type="password" 
        id="password" 
        name="password" 
        placeholder="Enter your password" 
        required 
        minlength="8"
        pattern="^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$"
        title="Password must be at least 8 characters long and contain both letters and numbers"
      >
      <small class="form-help"><i class="fas fa-info-circle"></i> At least 8 characters, must include letters and numbers</small>
    </div>
    
    <button type="submit" class="submit-button"><i class="fas fa-user-plus"></i> Register</button>
    
    <p class="auth__link">
      <i class="fas fa-sign-in-alt"></i> Already have an account? <a href="#/login">Login here</a>
    </p>
  </form>
</section>
    `;
  }

  async afterRender() {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      await this.#presenter.register(formData);
    });
  }
}

export default RegisterPage;
