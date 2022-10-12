import { Sequelize } from 'sequelize';
import dbConfig from '../../configs/db.mjs';

export default class DB {
  conn;

  static connection() {
    const predefinida = dbConfig.default;
    const config = dbConfig.connections[predefinida];

    if (!this.conn) {
      this.conn = new Sequelize(config.options.db_name, config.options.db_username, config.options.db_password, {
        host: config.options.db_host,
        port: config.options.db_port,
        dialect: config.motor,
        timezone: process.env.TIMEZONE || '-06:00',
        logging(str) {
          if (process.env.DB_LOGGER === 'true') console.log(str);
        },
      });
    }
    return this.conn;
  }

  static async testing() {
    try {
      await this.connect().authenticate();
      return true;
    } catch (e) {
      return false;
    }
  }
}
