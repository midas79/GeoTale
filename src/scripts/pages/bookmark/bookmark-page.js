import BookmarkPresenter from './bookmark-presenter';
import { showFormattedDate } from '../../utils';
import Database from '../../data/database';

class BookmarkPage {
  constructor() {
    this.presenter = new BookmarkPresenter(this);
  }

  async render() {
    return `
            <section class="entry-page container">
                <h1 class="entry-page__heading">Saved Stories</h1>
                <div id="entryCards" class="entry-page__grid"></div>
            </section>
        `;
  }

  async afterRender() {
    await this.presenter.showBookmarkedStories();
  }

  showStories(stories) {
    const container = document.getElementById('entryCards');
    if (!stories.length) {
      container.innerHTML = `<p>No stories saved.</p>`;
      return;
    }

    container.innerHTML = stories.map(story => this._createStoryCard(story)).join('');

    // Add event listener for delete button
    const deleteButtons = container.querySelectorAll('.delete-bookmark');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async event => {
        event.preventDefault();
        const storyId = button.dataset.id;
        await Database.removeStory(storyId);
        // Refresh bookmark list
        this.presenter.showBookmarkedStories();
      });
    });
  }

  _createStoryCard(story) {
    return `
                <article class="story-item">
                        <img src="${story.photoUrl}" alt="Photo of ${story.name}" class="story-item__image">
                        <div class="story-item__content">
                                <h2 class="story-item__title">${story.name}</h2>
                                <p class="story-item__description">${story.description}</p>
                                <p class="story-item__date"><i class="far fa-calendar-alt"></i> ${showFormattedDate(story.createdAt)}</p>
                                <a href="#/stories/${story.id}" class="read-more-button" data-id="${story.id}">
                                        View Details <i class="fas fa-arrow-right"></i>
                                </a>
                                <button class="delete-bookmark" data-id="${story.id}">
                                        <i class="fas fa-trash-alt"></i> Delete
                                </button>
                        </div>
                </article>
        `;
  }

  // Add event listener for "View Details" button in afterRender
  async afterRender() {
    await this.presenter.showBookmarkedStories();

    // Event delegation for "View Details" button
    const container = document.getElementById('entryCards');
    container.addEventListener('click', event => {
      const detailBtn = event.target.closest('.read-more-button');
      if (detailBtn) {
        event.preventDefault();
        const storyId = detailBtn.dataset.id;
        // Navigate to detail page, trigger router
        window.location.hash = `#/stories/${storyId}`;
        // If you want to directly call story-detail-page.js, you can import and call here
        // However, usually the router will handle based on the hash
      }
    });
  }
}

export default BookmarkPage;
