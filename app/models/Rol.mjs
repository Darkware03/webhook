import DB from "../nucleo/DB.mjs";
import psql from "sequelize";

class Rol extends psql.Model {
}

Rol.init({
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: psql.Sequelize.STRING,
        allowNull: false
    },
}, {
    timestamps: false,
    updatedAt: false,
    sequelize: DB.connection(),
    tableName: 'mnt_rol',
})

// await Usuario.sync({})

export default Rol; 