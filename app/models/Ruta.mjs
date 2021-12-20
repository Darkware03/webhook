import DB from "../nucleo/DB.mjs";
import psql from "sequelize";
import Rol from "./Rol.mjs";
import RutaRol from "./RutaRol.mjs"

class Ruta extends psql.Model {
}

Ruta.init({
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: psql.Sequelize.TEXT,
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
        type: psql.Sequelize.TEXT,
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
    updatedAt: false,
    sequelize: DB.connection(),
    tableName: 'mnt_ruta',
})

Ruta.belongsToMany(Rol, {
    through: RutaRol, 
    foreignKey: "id_ruta",
    otherKey: 'id_rol'
})

Ruta.sync(); 
export default Ruta; 