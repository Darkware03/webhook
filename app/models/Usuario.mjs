import DB from "../nucleo/DB.mjs";
import psql from "sequelize";

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