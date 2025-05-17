import { openDB } from 'idb';

const DATABASE_NAME = 'geotale';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db, oldVersion, newVersion, transaction) {
    // If the 'stories' object store doesn't exist, create it now
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    }
  },
});

const Database = {
  async saveStory(story) {
    // Save or update story by id
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async getStoryById(id) {
    // Get story by id
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async getAllStories() {
    // Get all stories from the object store
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async removeStory(id) {
    // Delete story by id
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

// Additional function to get stories saved manually (not cached)
export async function getSavedStories() {
  const all = await (await dbPromise).getAll(OBJECT_STORE_NAME);
  return all.filter(story => story.isCached !== true);
}

// Function to check if a story has been saved manually (not cached)
export async function isStorySaved(id) {
  const story = await (await dbPromise).get(OBJECT_STORE_NAME, id);
  return story && story.isCached !== true;
}

export default Database;
