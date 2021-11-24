import {Sequelize} from "sequelize";
import db_config from "../../configs/db.mjs";

export default class DB {

    static conection(conection = null) {
        if(conection){
            // console.log(db_config.conections.postgress)
            console.log(db_config.conections[conection])
        }
    }
}