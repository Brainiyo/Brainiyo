import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = '@brainiyo_cache_';
const OFFLINE_QUESTIONS_KEY = `${CACHE_KEY_PREFIX}offline_questions`;

export const CacheManager = {
  // Save questions for offline use (limit to 20 per topic as requested)
  cacheQuestions: async (topicId, questions) => {
    try {
      // Get existing cache
      const existingCacheJson = await AsyncStorage.getItem(OFFLINE_QUESTIONS_KEY);
      const cache = existingCacheJson ? JSON.parse(existingCacheJson) : {};
      
      // Update with new questions (take only up to 20)
      cache[topicId] = questions.slice(0, 20);
      
      // Save back to storage
      await AsyncStorage.setItem(OFFLINE_QUESTIONS_KEY, JSON.stringify(cache));
      return true;
    } catch (e) {
      console.error('Failed to cache questions:', e);
      return false;
    }
  },

  // Get cached questions for a topic
  getCachedQuestions: async (topicId) => {
    try {
      const cacheJson = await AsyncStorage.getItem(OFFLINE_QUESTIONS_KEY);
      if (!cacheJson) return [];
      
      const cache = JSON.parse(cacheJson);
      return cache[topicId] || [];
    } catch (e) {
      console.error('Failed to read cached questions:', e);
      return [];
    }
  },

  // Clear cache for a specific topic or all topics
  clearCache: async (topicId = null) => {
    try {
      if (topicId) {
        const cacheJson = await AsyncStorage.getItem(OFFLINE_QUESTIONS_KEY);
        if (cacheJson) {
          const cache = JSON.parse(cacheJson);
          delete cache[topicId];
          await AsyncStorage.setItem(OFFLINE_QUESTIONS_KEY, JSON.stringify(cache));
        }
      } else {
        await AsyncStorage.removeItem(OFFLINE_QUESTIONS_KEY);
      }
      return true;
    } catch (e) {
      console.error('Failed to clear cache:', e);
      return false;
    }
  }
};
