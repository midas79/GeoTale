import StoryDetailPresenter from './story-detail-presenter';
import { showFormattedDate } from '../../utils';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Database from '../../data/database';
import StoryAPI from '../../data/api';
import { isStorySaved } from '../../data/database';

class StoryDetailPage {
  #presenter = null;
  #map = null;
  #markerLayer = null;

  constructor() {
    this.#presenter = new StoryDetailPresenter(this);
  }

  async render() {
    return `
<section class="detail-story container">
  <a href="#/stories" class="back-button"> Go back to Stories</a>
  <div id="storyContent" class="detail-story__content">
    <p class="loading">Loading story details...</p>
  </div>
</section>
        `;
  }

  async afterRender() {
    const url = window.location.hash.slice(1);
    const storyId = url.split('/')[2];
    const contentContainer = document.getElementById('storyContent');

    this.#presenter = new StoryDetailPresenter(storyId, {
      view: this,
      apiModel: StoryAPI,
      dbModel: Database,
    });

    try {
      const story = await this.#presenter.getStoryDetail(storyId);
      const saved = await isStorySaved(storyId);

      contentContainer.innerHTML = `
                <h1 class="detail-story__title">${story.name}</h1>
                <p class="detail-story__date">${showFormattedDate(story.createdAt)}</p>
             
                <img
                    src="${story.photoUrl}"
                    alt="Photo of ${story.name}"
                    class="detail-story__image"
                >
             
                <p class="detail-story__description">${story.description}</p>
             
                ${
                  story.lat && story.lon
                    ? `
                    <div class="detail-story__map-container">
                        <h2>Location</h2>
                        <div class="detail-story__coordinates">
                            <i class="fas fa-map-pin"></i> 
                            Latitude: <span class="coordinate-value">${story.lat.toFixed(
                              6
                            )}</span>, 
                            Longitude: <span class="coordinate-value">${story.lon.toFixed(6)}</span>
                        </div>
                        <div id="map" class="detail-story__map"></div>
                    </div>
                    <div class="bookmark-actions" style="margin-top: 1rem;">
                        <button id="bookmark-button" class="custom-btn">
                          ${saved ? 'Remove Bookmark' : 'Save Story'}
                        </button>
                        <button id="notify-button" class="custom-btn">Try Notify Me</button>
                    </div>
                `
                    : ''
                }
                
            `;
      // after contentContainer.innerHTML = ...;

      const bookmarkButton = document.getElementById('bookmark-button');
      if (bookmarkButton) {
        bookmarkButton.addEventListener('click', async () => {
          const isSaved = await isStorySaved(storyId);

          if (!isSaved) {
            await Database.saveStory({ ...story, isCached: false }); // call from Database
            alert('✅ Story saved.');
          } else {
            await Database.removeStory(story.id);
            alert('✅ Story removed from bookmarks.');
          }

          const savedNow = await isStorySaved(storyId);
          bookmarkButton.textContent = savedNow ? '🗑️ Remove Bookmark' : 'Save Story';
        });
      }

      const notifyButton = document.getElementById('notify-button');
      if (notifyButton) {
        notifyButton.addEventListener('click', async () => {
          const isSaved = await isStorySaved(storyId);

          if (!isSaved) {
            alert('❗ Story is not saved yet. Please save it first to receive notifications.');
            return;
          }

          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            registration.showNotification('✅ Story Saved', {
              body: `"${story.name}" has been saved to your bookmarks.`,
              icon: '/icons/icon-192x192.png',
              tag: 'story-saved',
            });
          }
        });

        if (story.lat && story.lon) {
          const mapContainer = document.getElementById('map');
          this.#initMap(mapContainer, story.lat, story.lon);
          this.#addMarker(story.lat, story.lon, story);
        }
      }
    } catch (error) {
      contentContainer.innerHTML = `
                <div class="error-message">
                    Failed to load story. ${error.message}
                </div>
            `;
    }
  }

  #initMap(container, lat, lon) {
    this.#map = new Map({
      target: container,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([lon, lat]),
        zoom: 15,
      }),
    });

    this.#markerLayer = new VectorLayer({
      source: new VectorSource(),
    });

    this.#map.addLayer(this.#markerLayer);
  }

  #addMarker(lat, lon, story) {
    const marker = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
    });

    marker.setStyle(
      new Style({
        image: new Icon({
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
          scale: 1,
        }),
      })
    );

    this.#markerLayer.getSource().addFeature(marker);
  }

  async destroy() {
    if (this.#map) {
      this.#map.setTarget(null);
      this.#map = null;
    }
  }
}

export default StoryDetailPage;
