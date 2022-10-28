/* eslint-disable no-underscore-dangle */
import Redis from 'ioredis';

export default class RedisClient {
  static _instance;

  static async getInstance() {
    if (!this._instance) {
      this._instance = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
      });
    }
    return this._instance;
  }
}
