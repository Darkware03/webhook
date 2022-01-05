import DB from "../nucleo/DB.mjs";
import psql from "sequelize";

class Rol extends psql.Model {
    static associate(models) {
        this.belongsToMany(models.Ruta, {
            through: models.RutaRol,
            foreignKey: "id_rol",
            otherKey: 'id_ruta'
        })
        this.belongsToMany(models.Perfil, {
            through: models.PerfilRol,
            foreignKey: "id_rol",
            otherKey: 'id_perfil'
        })

        this.belongsToMany(models.Usuario, {
            through: models.UsuarioRol,
            foreignKey: "id_rol",
            otherKey: 'id_usuario'
        })
    }
}

Rol.init({
    id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: psql.Sequelize.STRING(255),
        allowNull: false
    },
}, {
    timestamps: false,
    sequelize: DB.connection(),
    tableName: 'mnt_rol',
})

export default Rol; 