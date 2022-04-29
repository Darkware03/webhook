/* eslint-disable no-plusplus */
// eslint-disable-next-line no-unused-vars
import Sequelize, { Op } from 'sequelize';
import {
  Rol, Ruta, RutaRol,
} from '../models/index.mjs';
import DB from '../nucleo/DB.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';

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
      nombre, uri, nombre_uri, mostrar, icono, orden, admin, publico, id_ruta_padre, roles,
    } = req.body;

    try {
      if (roles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < roles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          const rol = await Rol.findOne({ where: { id: roles[index] } });
          if (!rol) throw new NotFoundException(`No se encontró el rol con id ${roles[index]}`);
        }
      }
      const ruta = await Ruta.create(
        {
          // eslint-disable-next-line camelcase
          nombre, uri, nombre_uri, mostrar, icono, orden, admin, publico, id_ruta_padre,
        },
        { transaction: t },
      );
      await ruta.addRols(roles, { transaction: t });
      await t.commit();
      const idRuta = ruta.id;
      const us = await Ruta.getById(idRuta);
      const { Rols } = us.dataValues;

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

    if (Number.isNaN(id)) throw new UnprocessableEntityException('El parámetro no es un id válido');

    const ruta = await Ruta.findOne({
      where: {
        id,
      },
    });

    return res.status(HttpCode.HTTP_OK)
      .json(ruta);
  }

  static async addRutaRole(req, res) {
    const { id_ruta: idRuta } = req.params;
    const { roles } = req.body;

    if (Number.isNaN(idRuta)) throw new UnprocessableEntityException('El parametro no es un id válido');

    for (let index = 0; index < roles.length; index++) {
      // eslint-disable-next-line no-await-in-loop
      const rol = await Rol.findOne({ where: { id: roles[index] } });
      if (!rol) throw new NotFoundException(`No se encontró el rol con id ${roles[index]}`);
    }

    if (roles.length === 0) {
      throw new BadRequestException(
        'No se envío ningún rol',
      );
    }
    const ruta = await Ruta.findOne({ where: { id: idRuta } });
    if (!ruta) throw new NotFoundException(`No se encontró una ruta con id ${idRuta}`);
    const rutaRols = await ruta.addRols(roles);

    return res.status(HttpCode.HTTP_CREATED).json({
      ruta_rols: rutaRols,
    });
  }

  static async update(req, res) {
    const {
      // eslint-disable-next-line camelcase
      nombre, uri, nombre_uri, mostrar, icono, orden, admin, publico, id_ruta_padre,
    } = req.body;

    // eslint-disable-next-line no-unused-vars
    const ruta = await Ruta.update({
      // eslint-disable-next-line camelcase
      nombre, uri, nombre_uri, mostrar, icono, orden, admin, publico, id_ruta_padre,
    }, {
      where: {
        id: req.params.id,
      },
    });

    return res.status(HttpCode.HTTP_OK)
      .json({ message: 'Datos actualizados con exito' });
  }

  static async destroy(req, res) {
    const { id } = req.params;
    const ruta = await Ruta.findOne({ where: { id } });
    if (!ruta) throw new NotFoundException(`No se encontró una ruta con id ${id}`);
    if (Number.isNaN(id)) throw new UnprocessableEntityException('El parámetro no es un id válido');
    await Ruta.destroy({
      where: { id },
    });

    return res.status(HttpCode.HTTP_OK)
      .json({
        message: 'Ruta Eliminada',
      });
  }

  static async destroyRutaRol(req, res) {
    const { id_ruta: idRuta } = req.params;

    if (Number.isNaN(idRuta)) throw new UnprocessableEntityException('El parametro no es un id válido');

    await RutaRol.destroy({
      where: {
        id_ruta: idRuta,
      },
    });
    return res.status(HttpCode.HTTP_OK).json({ message: 'roles eliminados' });
  }

  static async getRutas(req, res) {
    const menu = await Ruta.getMenu(req.usuario.id);
    return res.status(HttpCode.HTTP_OK).json(menu);
  }
}
