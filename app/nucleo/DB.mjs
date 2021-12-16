import {Sequelize} from "sequelize";
import db_config from "../../configs/db.mjs";

export default class DB {

    static connection(connection = null) {
        const predefinida = db_config.default
        let config = {}
        if (connection)
            config = db_config.connections[connection]
        else config = db_config.connections[predefinida]

        return new Sequelize(config.options.db_name, config.options.db_username, config.options.db_password, {
            host: config.options.db_host,
            port: config.options.db_port,
            dialect: config.motor,
            logging: false
        })
    }

    static async testing(connection = null) {
        try {
            await this.connection(connection).authenticate()
            return true
        } catch (e) {
            return false
        }
    }

}