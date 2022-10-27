import RedisClient from './RedisClient.mjs';

export default class Cache {
  static async setEx(key, data, expiresIn = 3600) {
    const conn = await RedisClient.getInstance();
    const result = await conn.set(key, JSON.stringify(data));
    await conn.expire(key, expiresIn);
    return result;
  }

  static async get(key) {
    const conn = await RedisClient.getInstance();
    const data = await conn.get(key);
    return JSON.parse(data);
  }

  static async hSet(key, data, expiresIn = 3600) {
    const conn = await RedisClient.getInstance();
    const params = [key, ...Object.entries(data).flat(2)];
    const result = await conn.hmset(params);
    await conn.expire(key, expiresIn);
    return result;
  }

  static async hGet(key, ...field) {
    const conn = await RedisClient.getInstance();
    const params = [key, ...field];
    const result = await conn.hget(...params);
    return result;
  }

  static async hGetAll(key) {
    const conn = await RedisClient.getInstance();
    const result = await conn.hgetall(key);
    if (!Object.keys(result).length) return null;
    return result;
  }
}
