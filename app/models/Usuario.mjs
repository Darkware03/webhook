import DB from "../nucleo/DB.mjs";
import {Sequelize} from "sequelize";

const Usuario = DB.conection().define('usuario', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING
    },
    last_name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: Sequelize.TEXT
    },
    active: {
        type: Sequelize.BOOLEAN
    }
}, {
    timestamps: false,
})

export default Usuario