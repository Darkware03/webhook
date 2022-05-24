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
    this.hasMany(Ruta, {
      foreignKey: 'id_ruta_padre',
      as: 'rutas',
    });
    this.hasOne(Ruta, {
      foreignKey: 'id_ruta_padre',
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

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      uri: this.uri,
      nombre_uri: this.nombre_uri,
      icono: this.icono,
      mostrar: this.mostrar,
      orden: this.orden,
      id_ruta_padre: this.id_ruta_padre,
      childrens: this.rutas,
    };
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
