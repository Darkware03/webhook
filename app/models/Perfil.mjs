import DB from "../nucleo/DB.mjs";
import psql from "sequelize";
import Usuario from './Usuario.mjs'
import UsuarioPerfil from './UsuarioPerfil.mjs'
import Rol from './Rol.mjs'
import PerfilRol from './PerfilRol.mjs'


// model Perfil{
//     id @id @default(autoincrement())
//     nombre String
//     codigo String
// }

class Perfil extends psql.Model {
}

Perfil.init({
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: psql.Sequelize.STRING(30),
        allowNull: false
    },
    codigo: {
        type: psql.Sequelize.STRING(5),
    }
}, {
    timestamps: false,
    sequelize: DB.connection(),
    tableName: 'mnt_perfil',
})




export default Perfil; 