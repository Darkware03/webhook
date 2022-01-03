import DB from "../nucleo/DB.mjs";
import psql from "sequelize";

class RefreshToken extends psql.Model {
}


RefreshToken.init({
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    refresh_token: {
        type: psql.Sequelize.STRING,
    },
    id_usuario: {
        type: psql.Sequelize.INTEGER,
    },
    valid: {
        type: psql.Sequelize.DATE
    },
}, {
    timestamps: false,
    tableName: 'refresh_tokens',
    sequelize: DB.connection(),
})


export default RefreshToken