import DB from "../nucleo/DB.mjs";
import psql from "sequelize";


class Perfil extends psql.Model {
}

Perfil.init({
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: psql.Sequelize.TEXT,
        allowNull: false
    },
    codigo: {
        type: psql.Sequelize.TEXT,
    }
}, {
    timestamps: false,
    updatedAt: false,
    sequelize: DB.connection(),
    tableName: 'mnt_perfil',
})

export default Perfil; 