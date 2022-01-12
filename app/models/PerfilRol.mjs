import psql from 'sequelize';
import DB from '../nucleo/DB.mjs';

class PerfilRol extends psql.Model {
}

PerfilRol.init({
  id: {
    type: psql.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_perfil: {
    type: psql.Sequelize.INTEGER,
  },
  id_rol: {
    type: psql.Sequelize.INTEGER,
  },
}, {
  timestamps: false,
  updatedAt: false,
  sequelize: DB.connection(),
  tableName: 'mnt_perfil_rol',
});

export default PerfilRol;
