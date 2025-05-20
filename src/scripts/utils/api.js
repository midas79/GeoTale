// src/scripts/utils/api.js
const API_BASE_URL = 'https://story-api.dicoding.dev/v1';

/**
 * Handles API requests with offline support
 */
class Api {
  static async fetchWithOfflineSupport(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'API request failed');
      }

      return responseData;
    } catch (error) {
      // Check if the error is due to being offline
      if (!navigator.onLine) {
        console.log('Offline mode detected, checking cache...');

        // For GET requests, we can try to get from cache
        if (options.method === undefined || options.method === 'GET') {
          try {
            const cache = await caches.open('geotale-api-v1');
            const cachedResponse = await cache.match(url);

            if (cachedResponse) {
              const cachedData = await cachedResponse.json();
              console.log('Retrieved data from cache');

              // Add a flag to indicate this is cached data
              return {
                ...cachedData,
                _fromCache: true,
              };
            }
          } catch (cacheError) {
            console.error('Error retrieving from cache:', cacheError);
          }
        }

        // If it's a POST/PUT/DELETE or we couldn't get from cache
        return {
          error: true,
          message: 'You are offline. Please check your connection and try again.',
          _isOffline: true,
        };
      }

      // Re-throw original error if it's not an offline issue
      throw error;
    }
  }

  // Common API methods with offline support
  static async getStories() {
    return this.fetchWithOfflineSupport('/stories');
  }

  static async getStoryDetail(id) {
    return this.fetchWithOfflineSupport(`/stories/${id}`);
  }

  static async addStory(data) {
    return this.fetchWithOfflineSupport('/stories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Add more API methods as needed
}

export default Api;
