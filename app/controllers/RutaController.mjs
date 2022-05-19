/* eslint-disable no-plusplus */
// eslint-disable-next-line no-unused-vars
import {
  Rol, Ruta,
} from '../models/index.mjs';
import DB from '../nucleo/DB.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import VerifyModel from '../utils/VerifyModel.mjs';

export default class RutaController {
  static async index(req, res) {
    const rutas = await Ruta.findAll({ include: [Rol] });
    return res.status(HttpCode.HTTP_OK)
      .json(rutas);
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
      nombre, uri, nombre_uri: nombreUri, mostrar, icono, orden, admin, publico, id_ruta_padre: idRutaPadre, roles,
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
    const menu = await Ruta.getMenu(req.usuario.id);
    return res.status(HttpCode.HTTP_OK).json(menu);
  }
}
