import DB from "../nucleo/DB.mjs";
import psql from "sequelize";
import Perfil from "./Perfil.mjs";
import PerfilRol from "./PerfilRol.mjs"
import Ruta from "./Ruta.mjs"
import RutaRol from "./RutaRol.mjs"
import UsuarioRol from "./UsuarioRol.mjs"


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

Rol.belongsToMany(Perfil, {
    through: PerfilRol, 
    foreignKey: "id_rol",
    otherKey: 'id_perfil'
})

Rol.belongsToMany(Ruta, {
    through: RutaRol, 
    foreignKey: "id_rol",
    otherKey: 'id_ruta'
})

Rol.belongsToMany(Usuario, {
    through: UsuarioRol, 
    foreignKey: "id_rol",
    otherKey: 'id_usuario'
})


Rol.sync({})

export default Rol; 