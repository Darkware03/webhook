import DB from "../nucleo/DB.mjs";
import psql from "sequelize";

class Perfil extends psql.Model {
    static associate(models) {
        this.belongsToMany(models.Usuario, {
            through: models.UsuarioPerfil,
            foreignKey: "id_perfil",
            otherKey: 'id_usuario'
        })

        this.belongsToMany(models.Rol, {
            through: models.PerfilRol,
            foreignKey: "id_perfil",
            otherKey: 'id_rol'
        })
    }
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