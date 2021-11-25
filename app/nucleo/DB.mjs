import {Sequelize} from "sequelize";
import db_config from "../../configs/db.mjs";

export default class DB {

    static conection(conection = null) {
        const predefinida = db_config.default
        let config = {}
        if (conection)
            config = db_config.conections[conection]
        else config = db_config.conections[predefinida]

        return new Sequelize(config.options.db_name, config.options.db_username, config.options.db_password, {
            host: config.options.db_host,
            port: config.options.db_port,
            dialect: config.motor
        })
    }

    static async testing(conection = null) {
        try {
            await this.conection(conection).authenticate()
            return true
        } catch (e) {
            return false
        }
    }

    static async close(db){
        db.close()
    }
}