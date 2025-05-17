import { getSavedStories } from '../../data/database';

class BookmarkPresenter {
  constructor(view) {
    this.view = view;
  }

  async showBookmarkedStories() {
    try {
      const savedStories = await getSavedStories(); // directly use the imported function
      this.view.showStories(savedStories);
    } catch (error) {
      const container = document.getElementById('bookmark-list');
      container.innerHTML = `<p class="text-warning">Failed to load saved stories.</p>`;
    }
  }
}

export default BookmarkPresenter;
