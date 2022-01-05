import DB from "../nucleo/DB.mjs";
import psql from "sequelize";

class Ruta extends psql.Model {
}

Ruta.init({
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: psql.Sequelize.STRING(50),
        allowNull: false
    },
    uri: {
        type: psql.Sequelize.TEXT,
    },
    nombre_uri: {
        type: psql.Sequelize.TEXT,
    },
    mostrar: {
        type: psql.Sequelize.BOOLEAN,
        allowNull: false
    },
    icono: {
        type: psql.Sequelize.STRING(255),
    },
    orden: {
        type: psql.Sequelize.INTEGER,
    },
    publico: {
        type: psql.Sequelize.BOOLEAN,
    },
    id_ruta_padre: {
        type: psql.Sequelize.INTEGER,
    },
}, {
    timestamps: false,
    sequelize: DB.connection(),
    tableName: 'mnt_ruta',
})


export default Ruta; 