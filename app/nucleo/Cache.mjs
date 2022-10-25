import RedisClient from './RedisClient.mjs';

export default class Cache {
  static conn;

  constructor() {
    this.conn = RedisClient.getInstance();
  }

  async setex(key, data, expiresIn) {
    return this.conn.set(key, JSON.stringify(data), {
      EX: expiresIn,
      NX: true,
    });
  }

  async get(key) {
    const data = this.conn.get(key);
    return JSON.parse(data);
  }
}
