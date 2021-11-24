import {Sequelize} from "sequelize";
import db_config from "../../configs/db.mjs";

export default class DB {

    constructor() {
        console.log('se ejecuta')
        this.connect = null
    }

    conection(conection = null) {

        DB.conection(conection)
    }

    static conection(conection = null) {
        if (conection) {
            this.connect = conection
        }

    }
}