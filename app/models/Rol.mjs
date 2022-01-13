import psql from 'sequelize';
import DB from '../nucleo/DB.mjs';
// eslint-disable-next-line import/no-cycle
import Ruta from './Ruta.mjs';
import RutaRol from './RutaRol.mjs';
// eslint-disable-next-line import/no-cycle
import Perfil from './Perfil.mjs';
import PerfilRol from './PerfilRol.mjs';
// eslint-disable-next-line import/no-cycle
import Usuario from './Usuario.mjs';
import UsuarioRol from './UsuarioRol.mjs';

class Rol extends psql.Model {
  static associate() {
    this.belongsToMany(Ruta, {
      through: RutaRol,
      foreignKey: 'id_rol',
      otherKey: 'id_ruta',
    });
    this.belongsToMany(Perfil, {
      through: PerfilRol,
      foreignKey: 'id_rol',
      otherKey: 'id_perfil',
    });

    this.belongsToMany(Usuario, {
      through: UsuarioRol,
      foreignKey: 'id_rol',
      otherKey: 'id_usuario',
    });
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
    allowNull: false,
  },
}, {
  timestamps: false,
  sequelize: DB.connection(),
  tableName: 'mnt_rol',
});

export default Rol;
