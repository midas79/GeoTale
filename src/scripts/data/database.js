import { openDB } from 'idb';

const DATABASE_NAME = 'geotale';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db, oldVersion, newVersion, transaction) {
    // Jika object store 'stories' belum ada, buat sekarang
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    }
  },
});

const Database = {
  async saveStory(story) {
    // Menyimpan atau update story berdasarkan id
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async getStoryById(id) {
    // Ambil story berdasarkan id
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async getAllStories() {
    // Ambil semua story dari object store
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async removeStory(id) {
    // Hapus story berdasarkan id
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

// Fungsi tambahan untuk mendapatkan story yang disimpan manual (bukan cache)
export async function getSavedStories() {
  const all = await (await dbPromise).getAll(OBJECT_STORE_NAME);
  return all.filter(story => story.isCached !== true);
}

// Fungsi cek apakah story sudah disimpan manual (bukan cache)
export async function isStorySaved(id) {
  const story = await (await dbPromise).get(OBJECT_STORE_NAME, id);
  return story && story.isCached !== true;
}

export default Database;
