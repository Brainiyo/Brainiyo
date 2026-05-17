const Redis = require('ioredis');
const logger = require('../utils/logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false, // Don't hang requests when disconnected
});

redis.on('connect', () => {
  logger.info('Connected to Redis ✓');
});

redis.on('error', (err) => {
  logger.error('Redis Error', { error: err.message });
});

// Memory fallback for when Redis is down
const memoryStorage = new Map();

const isRedisUp = () => redis.status === 'ready';

// Safe wrappers to prevent API crashes/hangs when Redis is down
const safeRedis = {
  ...redis,
  get: async (key) => {
    if (isRedisUp()) {
      try { return await redis.get(key); } catch (e) { return memoryStorage.get(key); }
    }
    return memoryStorage.get(key);
  },
  setex: async (key, ttl, val) => {
    if (isRedisUp()) {
      try { return await redis.setex(key, ttl, val); } catch (e) { /* fallback */ }
    }
    memoryStorage.set(key, val);
    setTimeout(() => memoryStorage.delete(key), ttl * 1000);
    return 'OK';
  },
  del: async (key) => {
    if (isRedisUp()) {
      try { return await redis.del(key); } catch (e) { /* fallback */ }
    }
    return memoryStorage.delete(key);
  },
  set: async (key, val, ...args) => {
    if (isRedisUp()) {
      try { return await redis.set(key, val, ...args); } catch (e) { /* fallback */ }
    }
    return memoryStorage.set(key, val);
  },
  incr: async (key) => {
    if (isRedisUp()) {
      try { return await redis.incr(key); } catch (e) { /* fallback */ }
    }
    const val = (parseInt(memoryStorage.get(key)) || 0) + 1;
    memoryStorage.set(key, val.toString());
    return val;
  }
};

module.exports = safeRedis;
