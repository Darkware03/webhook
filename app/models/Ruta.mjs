import psql from 'sequelize';
import DB from '../nucleo/DB.mjs';
// eslint-disable-next-line import/no-cycle
import Rol from './Rol.mjs';
import RutaRol from './RutaRol.mjs';

class Ruta extends psql.Model {
  static associate() {
    this.belongsToMany(Rol, {
      through: RutaRol,
      foreignKey: 'id_ruta',
      otherKey: 'id_rol',
      onDelete: 'CASCADE',
      hooks: true,
    });
  }

  static async getById(id) {
    return this.findOne({
      where: {
        id,
      },
      attributes: ['id'],
      include: [
        {
          model: Rol,
          attributes: ['id', 'name'],
          through: {
            attributes: [],
          },
        },
      ],
    });
  }
}

Ruta.init({
  id: {
    type: psql.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: psql.Sequelize.STRING(50),
    allowNull: false,
  },
  uri: {
    type: psql.Sequelize.TEXT,
  },
  nombre_uri: {
    type: psql.Sequelize.TEXT,
  },
  mostrar: {
    type: psql.Sequelize.BOOLEAN,
    allowNull: false,
  },
  icono: {
    type: psql.Sequelize.STRING(255),
  },
  orden: {
    type: psql.Sequelize.INTEGER,
  },
  admin: {
    type: psql.Sequelize.BOOLEAN,
  },
  publico: {
    type: psql.Sequelize.BOOLEAN,
  },
  id_ruta_padre: {
    type: psql.Sequelize.INTEGER,
  },
}, {
  timestamps: false,
  sequelize: DB.connection(),
  tableName: 'mnt_ruta',
});

export default Ruta;
