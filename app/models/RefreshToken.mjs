import psql from 'sequelize';
import DB from '../nucleo/DB.mjs';
// eslint-disable-next-line import/no-cycle
import Usuario from './Usuario.mjs';

class RefreshToken extends psql.Model {
  static associate() {
    this.belongsTo(Usuario, {
      foreignKey: 'id_usuario',
    });
  }
}

const REFRESH_SCHEMA = {
  id: {
    type: psql.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  refresh_token: {
    type: psql.Sequelize.STRING,
  },
  id_usuario: {
    type: psql.Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'mnt_usuario',
      key: 'id',
    },
  },
  valid: {
    type: psql.Sequelize.DATE,
  },
};

const TABLE_NAME = 'refresh_tokens';

RefreshToken.init(REFRESH_SCHEMA, {
  timestamps: false,
  tableName: TABLE_NAME,
  sequelize: DB.connection(),
});

export {
  REFRESH_SCHEMA,
  TABLE_NAME,
};

export default RefreshToken;
