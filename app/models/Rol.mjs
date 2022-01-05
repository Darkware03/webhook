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
        type: psql.Sequelize.STRING(255),
        allowNull: false
    },
}, {
    timestamps: false,
    sequelize: DB.connection(),
    tableName: 'mnt_rol',
})

export default Rol; 