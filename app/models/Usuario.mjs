import DB from "../nucleo/DB.mjs";
import psql from "sequelize";
import RefreshToken from "./RefreshToken.mjs";
import Perfil from './Perfil.mjs'
import UsuarioPerfil from './UsuarioPerfil.mjs'


class Usuario extends psql.Model {
    toJSON() {
        return {
            id: this.id,
            email: this.email,
            last_login: this.last_login
        }
    }
}

Usuario.init({
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: psql.Sequelize.STRING,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: psql.Sequelize.TEXT
    },
    last_login: {
        type: psql.Sequelize.STRING
    },
    is_suspended: {
        type: psql.Sequelize.BOOLEAN,
        defaultValue: false
    },
    token_valid_after: {
        type: psql.Sequelize.DATE
    }
}, {
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    sequelize: DB.connection(),
    tableName: 'mnt_usuario',
})

Usuario.hasMany( RefreshToken,{
    foreignKey:'id_usuario'
})


Usuario.belongsToMany( Perfil , {
    through: UsuarioPerfil, 
    foreignKey: "id_usuario",
    otherKey: 'id_perfil'
})

await Usuario.sync({})

export default Usuario