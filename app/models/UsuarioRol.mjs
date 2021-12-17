import DB from "../nucleo/DB.mjs";
import psql from "sequelize";
import Usuario from "./Usuario"; 
import Rol from "./Rol"; 


class UsuarioRol extends psql.Model {
}

UsuarioRol.init({
    id_usario: {
        type: psql.Sequelize.INTEGER,
    },
    id: {
        type: psql.Sequelize.INTEGER,
    },
}, {
    timestamps: false,
    updatedAt: false,
    sequelize: DB.connection(),
    tableName: 'mnt_usuario_rol',
})

export default UsuarioRol; 