import DB from "../nucleo/DB.mjs";
import psql from "sequelize";
import Rol from "./Rol.mjs";
import UsuarioRol from "./UsuarioRol.mjs";
import RefreshToken from "./RefreshToken.mjs";
import Perfil from "./Perfil.mjs";
import UsuarioPerfil from "./UsuarioPerfil.mjs";

const UsuarioSchema = {
    id: {
        type: psql.Sequelize.INTEGER, primaryKey: true,
        autoIncrement: true,
    },
    email: {type: psql.Sequelize.STRING},
    password: {type: psql.Sequelize.TEXT},
    last_login: {type: psql.Sequelize.STRING},
    is_suspended: {type: psql.Sequelize.BOOLEAN,},
    token_valid_after: {type: psql.Sequelize.DATE}
}

class Usuario extends psql.Model {
    static associate() {
        this.belongsToMany(Rol, {
            through: UsuarioRol,
            foreignKey: "id_usuario",
            otherKey: 'id_rol'
        })
        this.hasMany(RefreshToken, {
            foreignKey: 'id_usuario'
        })
        this.belongsToMany(Perfil, {
            through: UsuarioPerfil,
            foreignKey: "id_usuario",
            otherKey: 'id_perfil'
        })
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            last_login: this.last_login
        }
    }
}

Usuario.init(UsuarioSchema, {
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    sequelize: DB.connection(),
    tableName: 'mnt_usuario',
})

export {
    UsuarioSchema
}
export default Usuario