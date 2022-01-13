import psql from 'sequelize';
import DB from '../nucleo/DB.mjs';
// eslint-disable-next-line import/no-cycle
import Usuario from './Usuario.mjs';
import UsuarioPerfil from './UsuarioPerfil.mjs';
import PerfilRol from './PerfilRol.mjs';
// eslint-disable-next-line import/no-cycle
import Rol from './Rol.mjs';

class Perfil extends psql.Model {
  static associate() {
    this.belongsToMany(Usuario, {
      through: UsuarioPerfil,
      foreignKey: 'id_perfil',
      otherKey: 'id_usuario',
    });

    this.belongsToMany(Rol, {
      through: PerfilRol,
      foreignKey: 'id_perfil',
      otherKey: 'id_rol',
    });
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
    allowNull: false,
  },
  codigo: {
    type: psql.Sequelize.STRING(5),
  },
}, {
  timestamps: false,
  sequelize: DB.connection(),
  tableName: 'mnt_perfil',
});

export default Perfil;
