import psql from 'sequelize';
import DB from '../nucleo/DB.mjs';

class UsuarioPerfil extends psql.Model {
}

UsuarioPerfil.init({
  id: {
    type: psql.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_perfil: {
    type: psql.Sequelize.INTEGER,
    allowNull: false,
  },
  id_usuario: {
    type: psql.Sequelize.INTEGER,
  },
}, {
  timestamps: false,
  updatedAt: false,
  sequelize: DB.connection(),
  tableName: 'mnt_usuario_perfil',
});

export default UsuarioPerfil;
