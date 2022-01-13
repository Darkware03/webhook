import psql from 'sequelize';
import DB from '../nucleo/DB.mjs';

class RutaRol extends psql.Model {
}

RutaRol.init({
  id: {
    type: psql.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_ruta: {
    type: psql.Sequelize.INTEGER,
  },
  id_rol: {
    type: psql.Sequelize.INTEGER,
  },
}, {
  timestamps: false,
  updatedAt: false,
  sequelize: DB.connection(),
  tableName: 'mnt_ruta_rol',
});

export default RutaRol;
