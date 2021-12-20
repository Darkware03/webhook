import DB from "../nucleo/DB.mjs";
import psql from "sequelize";


class Bitacora extends psql.Model {
}

Bitacora.init({
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_usuario: {
        type: psql.Sequelize.INTEGER,
    },
    fecha_hora_reg: {
        type: psql.Sequelize.DATE,
        allowNull: false
    },
    ip_cliente: {
        type: psql.Sequelize.TEXT,
    },
    ip_servidor: {
        type: psql.Sequelize.TEXT,
    },
    metodo_http: {
        type: psql.Sequelize.TEXT,
        allowNull: false
    },
    request_headers: {
        type: psql.Sequelize.TEXT,
    },
    request_uri: {
        type: psql.Sequelize.TEXT,
    },
    request_parameters: {
        type: psql.Sequelize.TEXT,
    },
    request_constent: {
        type: psql.Sequelize.TEXT,
    },
    xrd_userid: {
        type: psql.Sequelize.TEXT,
    },
    xrd_messageid: {
        type: psql.Sequelize.TEXT,
    },
    xrd_client: {
        type: psql.Sequelize.TEXT,
    },
    xrd_service: {
        type: psql.Sequelize.TEXT,
    },
}, {
    timestamps: false,
    updatedAt: false,
    sequelize: DB.connection(),
    tableName: 'bt_bitacora',
})

export default Bitacora; 