import psql from 'sequelize';
import DB from '../nucleo/DB.mjs';

class MetodoAutenticacionUsuario extends psql.Model {
}

MetodoAutenticacionUsuario.init({
  id: {
    type: psql.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: psql.Sequelize.INTEGER,
  },
  id_metodo: {
    type: psql.Sequelize.INTEGER,
  },
  secret_key: {
    type: psql.Sequelize.STRING,
  },
  is_primary: {
    type: psql.Sequelize.BOOLEAN,
  },
  temporal_key: {
    type: psql.Sequelize.STRING,
  },
}, {
  timestamps: false,
  sequelize: DB.connection(),
  tableName: 'mnt_metodo_autenticacion_usuario',
});

export default MetodoAutenticacionUsuario;
