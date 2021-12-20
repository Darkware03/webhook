import DB from "../nucleo/DB.mjs";
import psql from "sequelize";


class UsuarioRol extends psql.Model {
}

UsuarioRol.init({
    id_usuario: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true
    },
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true
    },
}, {
    timestamps: false,
    updatedAt: false,
    sequelize: DB.connection(),
    tableName: 'mnt_usuario_rol',
})

export default UsuarioRol; 