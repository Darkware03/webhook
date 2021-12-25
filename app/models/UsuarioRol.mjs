import DB from "../nucleo/DB.mjs";
import psql from "sequelize";


class UsuarioRol extends psql.Model {
}

UsuarioRol.init({
    id_usuario: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true
    },
    id_rol: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true
    },
}, {
    timestamps: false,
    updatedAt: false,
    sequelize: DB.connection(),
    tableName: 'mnt_usuario_rol',
})

await UsuarioRol.sync({}); 

export default UsuarioRol; 