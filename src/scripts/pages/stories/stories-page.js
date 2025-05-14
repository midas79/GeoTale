import StoriesPresenter from './stories-presenter';
import { showFormattedDate } from '../../utils';
import MapHelper from '../../utils/map';
import VectorLayer from 'ol/layer/Vector';

class StoriesPage {
  #presenter = null;
  #map = null;
  #markers = [];

  constructor() {
    this.#presenter = new StoriesPresenter(this);
  }

  async render() {
    return `
    <section id="contentWrapper" class="entry-page container">
      <h1 class="entry-page__heading">Explore Stories</h1>

      <div id="entryCards" class="entry-page__grid"></div>

      <div class="entry-page__nav">
        <button id="btnPrev" class="nav-btn" aria-label="Previous page">
          <i class="fas fa-chevron-left"></i> Previous
        </button>
        <span id="paginationStatus" class="nav-info">Page 1</span>
        <button id="btnNext" class="nav-btn" aria-label="Next page">
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <div id="mapWrapper" class="entry-page__map" aria-label="Story location map"></div>

      <a href="#/stories/add" class="fab-button" aria-label="Add new story">
        <i class="fas fa-plus"></i>
      </a>
    </section>
  `;
  }

  async afterRender() {
    const storiesContainer = document.querySelector('#entryCards');
    const mapContainer = document.querySelector('#mapWrapper');
    const prevButton = document.querySelector('#btnPrev');
    const nextButton = document.querySelector('#btnNext');
    const pageInfo = document.querySelector('#paginationStatus');

    // Initialize map (non-interactive)
    this.#map = MapHelper.initMap(mapContainer, false);

    const loadStories = async page => {
      try {
        const result = await this.#presenter.loadStories(page);
        if (!result) return;

        const { stories, hasMore, currentPage } = result;
        storiesContainer.innerHTML = '';

        // Remove old markers from the map
        const vectorLayer = this.#map
          .getLayers()
          .getArray()
          .find(layer => layer instanceof VectorLayer);

        if (vectorLayer) {
          const source = vectorLayer.getSource();
          this.#markers.forEach(marker => {
            source.removeFeature(marker);
          });
        }

        this.#markers = [];

        stories.forEach(story => {
          storiesContainer.innerHTML += this._createStoryCard(story);

          if (story.lat && story.lon) {
            const marker = MapHelper.addMarker(
              this.#map,
              story.lat,
              story.lon,
              this._createPopupContent(story)
            );
            this.#markers.push(marker);
          }
        });

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = !hasMore;
        pageInfo.textContent = `Page ${currentPage}`;
      } catch (error) {
        console.error(error);
        storiesContainer.innerHTML = '<div class="error-message">Failed to load stories</div>';
      }
    };

    await loadStories(1);

    prevButton.addEventListener('click', async () => {
      const currentPage = this.#presenter.getCurrentPage();
      if (currentPage > 1) {
        await loadStories(currentPage - 1);
      }
    });

    nextButton.addEventListener('click', async () => {
      const currentPage = this.#presenter.getCurrentPage();
      await loadStories(currentPage + 1);
    });
  }

  _createStoryCard(story) {
    return `
      <article class="story-item">
        <img src="${story.photoUrl}" alt="Photo of ${story.name}" class="story-item__image">
        <div class="story-item__content">
          <h2 class="story-item__title">${story.name}</h2>
          <p class="story-item__description">${story.description}</p>
          <p class="story-item__date"><i class="far fa-calendar-alt"></i> ${showFormattedDate(
            story.createdAt
          )}</p>
          <a href="#/stories/${story.id}" class="read-more-button">
            Read more <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `;
  }

  _createPopupContent(story) {
    return `
      <div class="popup-content">
        <h3>${story.name}</h3>
        <img src="${story.photoUrl}" alt="Photo of ${story.name}" style="max-width: 200px;">
        <p>${story.description}</p>
      </div>
    `;
  }

  async destroy() {
    if (this.#map) {
      // Disable map
      this.#map.setTarget(null);
    }

    const vectorLayer = this.#map
      ?.getLayers()
      .getArray()
      .find(layer => layer instanceof VectorLayer);

    if (vectorLayer) {
      const source = vectorLayer.getSource();
      this.#markers.forEach(marker => {
        source.removeFeature(marker);
      });
      this.#markers = [];
    }
  }
}

export default StoriesPage;
