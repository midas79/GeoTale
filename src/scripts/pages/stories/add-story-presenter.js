import StoryAPI from '../../data/api';
import Swal from 'sweetalert2';

class AddStoryPresenter {
  #view = null;
  #stream = null;
  #selectedLocation = null;
  #autoStopCameraListenersAdded = false;

  constructor(view) {
    this.#view = view;
  }

  async addStory(description, photo) {
    try {
      // Log data for debugging
      console.log('AddStoryPresenter.addStory - description:', description);
      console.log('AddStoryPresenter.addStory - photo:', photo);
      console.log('AddStoryPresenter.addStory - location:', this.#selectedLocation);

      // Validate all required fields
      if (!this._validateAllFields(description, photo)) {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      // Explicitly validate photo
      if (!(photo instanceof File)) {
        console.error('Photo is not a File object:', photo);
        throw new Error('Invalid photo format');
      }

      const data = {
        description,
        photo,
      };

      if (this.#selectedLocation) {
        data.lat = this.#selectedLocation.lat;
        data.lon = this.#selectedLocation.lng;
      }

      console.log('Sending story data to API:', {
        description: data.description,
        photoName: data.photo.name,
        photoSize: data.photo.size,
        photoType: data.photo.type,
        location: this.#selectedLocation ? `${data.lat}, ${data.lon}` : 'none',
      });

      const response = await StoryAPI.addStory(data, token);
      console.log('API response:', response);

      if (response.error) {
        throw new Error(response.message);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Story added successfully',
        timer: 1500,
        showConfirmButton: false,
      });

      await this.stopCamera();

      window.location.hash = '#/stories';
    } catch (error) {
      console.error('Error in addStory:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Add Story',
        text: error.message,
      });

      if (error.message === 'Token not found') {
        window.location.hash = '#/login';
      }
    }
  }

  _validateAllFields(description, photo) {
    console.log('Validating fields - description:', !!description);
    console.log('Validating fields - photo:', !!photo);
    console.log('Validating fields - location:', !!this.#selectedLocation);

    const missingFields = [];

    if (!description || description.trim().length === 0) {
      missingFields.push('story');
    }

    if (!photo) {
      missingFields.push('photo');
    } else if (!(photo instanceof File)) {
      console.error('Photo is not a File object:', photo);
      missingFields.push('photo (invalid format)');
    }

    if (!this.#selectedLocation) {
      missingFields.push('location');
    }

    if (missingFields.length > 0) {
      console.warn('Missing fields:', missingFields);
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Data',
        text: `Please complete your ${missingFields.join(', ')}`,
      });
      return false;
    }

    return true;
  }

  async startCamera() {
    try {
      console.log('Starting camera...');

      await this.stopCamera();

      this.#addAutoStopCameraListeners();

      this.#stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      console.log('Camera started successfully:', this.#stream);
      return this.#stream;
    } catch (error) {
      console.error('Error starting camera:', error);
      throw new Error('Unable to access camera');
    }
  }

  async stopCamera() {
    if (this.#stream) {
      console.log('Stopping camera...');

      const tracks = this.#stream.getTracks();
      tracks.forEach(track => track.stop());

      this.#stream = null;
      console.log('Camera stopped');
      return true;
    }
    return false;
  }

  #addAutoStopCameraListeners() {
    if (this.#autoStopCameraListenersAdded) return;

    window.addEventListener('hashchange', () => {
      this.stopCamera();
    });

    window.addEventListener('beforeunload', () => {
      this.stopCamera();
    });

    this.#autoStopCameraListenersAdded = true;
  }

  validateImage(file) {
    console.log('Validating image:', file);

    if (!(file instanceof File)) {
      throw new Error('Invalid file');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > 1024 * 1024) {
      throw new Error('File size must not exceed 1MB');
    }

    console.log('Image validation passed');
    return true;
  }

  setSelectedLocation(location) {
    console.log('Location selected:', location);
    this.#selectedLocation = location;
  }

  getSelectedLocation() {
    return this.#selectedLocation;
  }
}

export default AddStoryPresenter;
