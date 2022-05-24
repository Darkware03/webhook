/* eslint-disable no-plusplus */
// eslint-disable-next-line no-unused-vars
import { Op } from 'sequelize';
import {
  Rol, Ruta,
} from '../models/index.mjs';
import DB from '../nucleo/DB.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import VerifyModel from '../utils/VerifyModel.mjs';
import getRols from '../services/getRols.mjs';

export default class RutaController {
  static async index(req, res) {
    const {
      page = 1,
      per_page: perPage = 10,
      nombre,
      uri,
    } = req.query;

    const filtro = {};
    if (nombre) filtro.nombre = { [Op.iLike]: `%${nombre}%` };
    if (uri) filtro.uri = { [Op.iLike]: `%${uri}%` };

    const { count: totalRows, rows: rutas } = await Ruta.findAndCountAll({
      include: [Rol],
      where: filtro,
      limit: perPage,
      offset: perPage * (page - 1),
    });
    return res.status(HttpCode.HTTP_OK)
      .json({
        page,
        per_page: perPage,
        total_rows: totalRows,
        body: rutas,
      });
  }

  static async store(req, res) {
    const connection = DB.connection();
    const t = await connection.transaction();
    const {
      // eslint-disable-next-line camelcase
      nombre,
      uri,
      nombre_uri: nombreUri,
      mostrar,
      icono,
      orden,
      admin,
      publico,
      id_ruta_padre: idRutaPadre,
      roles,
    } = req.body;

    try {
      if (roles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < roles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          await VerifyModel.exist(Rol, roles[index], `No se encontró el rol con id ${roles[index]}`);
        }
      }
      const ruta = await Ruta.create(
        {
          nombre,
          uri,
          nombre_uri: nombreUri,
          mostrar,
          icono,
          orden,
          admin,
          publico,
          id_ruta_padre: idRutaPadre,
        },
        { transaction: t },
      );
      await ruta.addRols(roles, { transaction: t });
      await t.commit();
      const idRuta = ruta.id;
      const { Rols } = await Ruta.getById(idRuta, {
        include: [
          {
            model: Rol,
          },
        ],
      });

      return res.status(HttpCode.HTTP_CREATED).json({
        id: ruta.id,
        nombre: ruta.nombre,
        nombre_uri: ruta.nombre_uri,
        mostrar: ruta.mostrar,
        icono: ruta.icono,
        orden: ruta.orden,
        admin: ruta.admin,
        publico: ruta.publico,
        id_ruta_padre: ruta.id_ruta_padre,
        roles: Rols,
      });
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  static async show(req, res) {
    const { id } = req.params;
    const ruta = await VerifyModel.exist(Ruta, id, `No se encontró una ruta con id ${id}`, {
      include: {
        model: Rol, attributes: ['id', 'name'],
      },
    });
    return res.status(HttpCode.HTTP_OK).json(ruta); // ?
  }

  static async update(req, res) {
    const {
      // eslint-disable-next-line camelcase
      nombre,
      uri,
      nombre_uri: nombreUri,
      mostrar,
      icono,
      orden,
      admin,
      publico,
      id_ruta_padre: idRutaPadre,
      roles,
    } = req.body;

    const { id } = req.params;
    const ruta = await VerifyModel.exist(Ruta, id, `No se encontró una ruta con id ${id}`);
    await ruta.update({
      nombre, uri, nombre_uri: nombreUri, mostrar, icono, orden, admin, publico, id_ruta_padre: idRutaPadre,
    });
    await ruta.setRols(roles);

    return res.status(HttpCode.HTTP_OK)
      .json({ message: 'Datos actualizados con exito' });
  }

  static async getRutas(req, res) {
    const frontAdmin = (process.env.FRONT_ADMIN_HOST).split('||');
    const filtro = {
      admin: false,
    };

    if (frontAdmin.includes(req.headers.origin)) filtro.admin = true;

    const roles = await getRols.roles(req.usuario.id, 'id');
    const menu = await Ruta.findAll({
      attributes: ['id', 'nombre', 'uri', 'nombre_uri', 'icono', 'mostrar', 'orden', 'id_ruta_padre'],
      include: [
        {
          model: Rol,
          where: { id: roles },
          attributes: [],
        },
      ],
      where: filtro,
      order: ['orden'],
    });

    const rutas = RutaController.sortRoutes(menu);

    return res.status(HttpCode.HTTP_OK).json(rutas);
  }

  static sortRoutes(menu) {
    menu.forEach((ruta) => {
      // eslint-disable-next-line no-param-reassign
      ruta.rutas = (menu.filter((rutaHija) => rutaHija.id_ruta_padre === ruta.id));
    });

    const rutas = menu.filter((ruta) => ruta.id_ruta_padre === null);

    return rutas;
  }
}
