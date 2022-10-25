/* eslint-disable no-underscore-dangle */
import redis from 'redis';

export default class RedisClient {
  static _instance;

  static async getInstance() {
    if (!this._instance) {
      this._instance = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
        password: process.env.REDIS_PASSWORD,
      });
      await this._instance.connect();
    }
    return this._instance;
  }
}
