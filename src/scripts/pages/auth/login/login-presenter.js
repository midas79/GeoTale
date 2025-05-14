import StoryAPI from '../../../data/api';

class LoginPresenter {
  #view = null;

  constructor(view) {
    this.#view = view;
  }

  async login(formData) {
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    const response = await StoryAPI.login(data);

    return response;
  }
}

export default LoginPresenter;
