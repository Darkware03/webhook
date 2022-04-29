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

  static async getMenu(idUsuario) {
    const padres = await Ruta.#rutaPadre(idUsuario);
    await Ruta.#inheritanceRoutes(padres, idUsuario);
    return padres;
  }

  static async #inheritanceRoutes(padres, idUsuario) {
    // eslint-disable-next-line no-restricted-syntax
    for await (const padre of padres) {
      const childrends = await Ruta.#childrensRutas(idUsuario, padre.id);
      if (childrends.length > 0) {
        await Ruta.#inheritanceRoutes(childrends, idUsuario);
        padre.childrens = childrends;
      }
    }
  }

  static async #childrensRutas(idUsuario, idRuta) {
    const sql = `select r.id, r.nombre, r.uri, r.nombre_uri, r.mostrar, r.icono, r.orden
from mnt_ruta r join mnt_ruta_rol rr on rr.id_ruta=r.id
    where r.id_ruta_padre=? and r.mostrar = true and rr.id_rol in (select distinct r.id
          from mnt_usuario u
                   join mnt_usuario_rol ur on ur.id_usuario=u.id
                   join mnt_rol r on r.id=ur.id_rol
          where u.id=? union distinct
          select distinct r.id
          from mnt_usuario u
                   join mnt_usuario_perfil up on up.id_usuario=u.id
                   join mnt_perfil p on p.id=up.id_perfil
                   join mnt_perfil_rol pr on pr.id_perfil=p.id
                   join mnt_rol r on r.id=pr.id_rol where u.id=?);`;

    const childrens = await DB.connection().query(sql, {
      type: psql.QueryTypes.SELECT, replacements: [idRuta, idUsuario, idUsuario],
    });

    return childrens;
  }

  static async #rutaPadre(idUsuario) {
    const sql = `select r.id, r.nombre, r.uri, r.nombre_uri, r.mostrar, r.icono, r.orden from mnt_ruta r where id_ruta_padre is null and id in (
select r.id_ruta_padre
from mnt_ruta r join mnt_ruta_rol rr on rr.id_ruta=r.id
where r.id_ruta_padre is not null and rr.id_rol in (select distinct r.id
                from mnt_usuario u
                         join mnt_usuario_rol ur on ur.id_usuario=u.id
                         join mnt_rol r on r.id=ur.id_rol
                where u.id=? union distinct
                select distinct r.id
                from mnt_usuario u
                         join mnt_usuario_perfil up on up.id_usuario=u.id
                         join mnt_perfil p on p.id=up.id_perfil
                         join mnt_perfil_rol pr on pr.id_perfil=p.id
                         join mnt_rol r on r.id=pr.id_rol where u.id=?))
                union distinct
select r.id, r.nombre, r.uri, r.nombre_uri, r.mostrar, r.icono, r.orden
from mnt_ruta r join mnt_ruta_rol rr on rr.id_ruta=r.id
where r.id_ruta_padre is null and rr.id_rol in (select distinct r.id
                from mnt_usuario u
                         join mnt_usuario_rol ur on ur.id_usuario=u.id
                         join mnt_rol r on r.id=ur.id_rol
                where u.id=? union distinct
                select distinct r.id
                from mnt_usuario u
                         join mnt_usuario_perfil up on up.id_usuario=u.id
                         join mnt_perfil p on p.id=up.id_perfil
                         join mnt_perfil_rol pr on pr.id_perfil=p.id
                         join mnt_rol r on r.id=pr.id_rol where u.id=?);`;

    const padres = await DB.connection().query(sql, {
      type: psql.QueryTypes.SELECT, replacements: [idUsuario, idUsuario, idUsuario, idUsuario],
    });

    return padres;
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
