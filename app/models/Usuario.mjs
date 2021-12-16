import DB from "../nucleo/DB.mjs";
import psql from "sequelize";

class Usuario extends psql.Model {
}

Usuario.init({
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: psql.Sequelize.STRING
    },
    last_name: {
        type: psql.Sequelize.STRING
    },
    email: {
        type: psql.Sequelize.STRING,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: psql.Sequelize.TEXT
    },
    active: {
        type: psql.Sequelize.BOOLEAN
    }
}, {
    timestamps: false,
    sequelize: DB.connection(),
    tableName: 'usuarios',
})

await Usuario.sync({})

export default Usuario