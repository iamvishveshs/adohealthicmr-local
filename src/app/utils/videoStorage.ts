// IndexedDB utility for storing videos (handles large files better than localStorage)

const DB_NAME = 'AdoHealthVideos';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

interface VideoData {
  moduleId: number;
  videoType: 'english' | 'punjabi' | 'hindi' | 'activity';
  videoId: number;
  preview: string;
  fileName: string;
  fileSize: number;
}

let db: IDBDatabase | null = null;

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: ['moduleId', 'videoType', 'videoId'] });
        objectStore.createIndex('moduleId', 'moduleId', { unique: false });
        objectStore.createIndex('videoType', 'videoType', { unique: false });
      }
    };
  });
};

// Save video to IndexedDB
export const saveVideo = async (moduleId: number, videoType: 'english' | 'punjabi' | 'hindi' | 'activity', video: { id: number; preview: string; fileName: string; fileSize: number }): Promise<void> => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const videoData: VideoData = {
      moduleId,
      videoType,
      videoId: video.id,
      preview: video.preview,
      fileName: video.fileName,
      fileSize: video.fileSize
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(videoData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving video to IndexedDB:', error);
    throw error;
  }
};

// Get all videos for a module
export const getVideos = async (moduleId: number): Promise<{
  english: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
  punjabi: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
  hindi: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
  activity: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
}> => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('moduleId');
    
    const videos: {
      english: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
      punjabi: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
      hindi: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
      activity: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
    } = {
      english: [],
      punjabi: [],
      hindi: [],
      activity: []
    };

    return new Promise((resolve, reject) => {
      const request = index.getAll(moduleId);
      
      request.onsuccess = () => {
        const results = request.result as VideoData[];
        results.forEach((videoData) => {
          videos[videoData.videoType].push({
            id: videoData.videoId,
            preview: videoData.preview,
            fileName: videoData.fileName,
            fileSize: videoData.fileSize
          });
        });
        resolve(videos);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting videos from IndexedDB:', error);
    return {
      english: [],
      punjabi: [],
      hindi: [],
      activity: []
    };
  }
};

// Get all videos for all modules
export const getAllVideos = async (): Promise<{
  [moduleId: number]: {
    english: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
    punjabi: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
    hindi: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
    activity: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
  };
}> => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const allVideos: {
      [moduleId: number]: {
        english: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
        punjabi: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
        hindi: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
        activity: Array<{ id: number; preview: string; fileName: string; fileSize: number }>;
      };
    } = {};

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result as VideoData[];
        results.forEach((videoData) => {
          if (!allVideos[videoData.moduleId]) {
            allVideos[videoData.moduleId] = {
              english: [],
              punjabi: [],
              hindi: [],
              activity: []
            };
          }
          allVideos[videoData.moduleId][videoData.videoType].push({
            id: videoData.videoId,
            preview: videoData.preview,
            fileName: videoData.fileName,
            fileSize: videoData.fileSize
          });
        });
        resolve(allVideos);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting all videos from IndexedDB:', error);
    return {};
  }
};

// Remove a video
export const removeVideo = async (moduleId: number, videoType: 'english' | 'punjabi' | 'hindi' | 'activity', videoId: number): Promise<void> => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete([moduleId, videoType, videoId]);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error removing video from IndexedDB:', error);
    throw error;
  }
};

// Remove all videos for a module
export const removeModuleVideos = async (moduleId: number): Promise<void> => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('moduleId');
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(moduleId));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error removing module videos from IndexedDB:', error);
    throw error;
  }
};

// Clear all videos (for cleanup)
export const clearAllVideos = async (): Promise<void> => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing all videos from IndexedDB:', error);
    throw error;
  }
};
