import StoryAPI from '../../../data/api';
import Swal from 'sweetalert2';

class RegisterPresenter {
  #view = null;

  constructor(view) {
    this.#view = view;
  }

  async register(formData) {
    try {
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      };

      const response = await StoryAPI.register(data);

      if (response.error) {
        throw new Error(response.message);
      }

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: 'Please log in with your account',
        timer: 1500,
        showConfirmButton: false,
      });

      // Redirect to login
      window.location.hash = '#/login';
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.message,
      });
    }
  }
}

export default RegisterPresenter;
