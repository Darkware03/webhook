import DB from "../nucleo/DB.mjs";
import psql from "sequelize";

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