const logger = require('../utils/logger');

// In-memory Mock Redis so the app works fully on Windows without needing Docker/Redis
class MockRedis {
  constructor() {
    this.store = new Map();
    this.lists = new Map();
    logger.info('Using in-memory Mock Redis');
  }

  async get(key) { return this.store.get(key) || null; }
  
  async set(key, value) { this.store.set(key, value); return 'OK'; }
  
  async setex(key, seconds, value) { this.store.set(key, value); return 'OK'; }
  
  async del(key) { this.store.delete(key); return 1; }
  
  async incr(key) {
    const val = parseInt(this.store.get(key) || '0', 10) + 1;
    this.store.set(key, val.toString());
    return val;
  }
  
  async expire(key, seconds) { return 1; }
  
  async expireat(key, timestamp) { return 1; }
  
  async expireAt(key, timestamp) { return 1; }
  
  async lpush(key, value) {
    if (!this.lists.has(key)) this.lists.set(key, []);
    this.lists.get(key).unshift(value);
    return this.lists.get(key).length;
  }
  
  async lrange(key, start, stop) {
    const list = this.lists.get(key) || [];
    return list.slice(start, stop === -1 ? undefined : stop + 1);
  }
  
  async ltrim(key, start, stop) {
    if (this.lists.has(key)) {
      this.lists.set(key, this.lists.get(key).slice(start, stop === -1 ? undefined : stop + 1));
    }
    return 'OK';
  }
  
  on(event, handler) {}
}

const redis = new MockRedis();
module.exports = redis;
