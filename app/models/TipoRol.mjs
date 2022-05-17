/* eslint-disable import/no-cycle */
import psql from 'sequelize';
import DB from '../nucleo/DB.mjs';
import Rol from './Rol.mjs';

class TipoRol extends psql.Model {
  static associate() {
    this.hasMany(Rol, {
      foreignKey: 'id_tipo_rol',
    });
  }
}

TipoRol.init({
  id: {
    type: psql.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: psql.Sequelize.STRING(255),
    allowNull: false,
  },
  prefijo: {
    type: psql.Sequelize.STRING(255),
    allowNull: false,
  },
}, {
  timestamps: false,
  sequelize: DB.connection(),
  tableName: 'ctl_tipo_rol',
});

export default TipoRol;
