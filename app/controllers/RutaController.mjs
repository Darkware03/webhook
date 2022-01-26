// eslint-disable-next-line no-unused-vars
import Sequelize, { Op } from 'sequelize';
import {
  Rol, Ruta, Usuario, Perfil, RutaRol,
} from '../models/index.mjs';
import DB from '../nucleo/DB.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';
import Security from '../services/security.mjs';

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
      nombre,
      uri,
      // eslint-disable-next-line camelcase
      nombre_uri,
      mostrar,
      icono,
      orden,
      admin,
      publico,
      // eslint-disable-next-line camelcase
      id_ruta_padre,
      roles,
    } = req.body;

    try {
      if (roles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < roles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          const rol = await Rol.findOne({ where: { id: roles[index] } });
          if (!rol) throw new NotFoundException('NOT_FOUND', 404, `No se encontró el rol con id ${roles[index]}`);
        }
      }
      const ruta = await Ruta.create(
        {
          nombre,
          uri,
          // eslint-disable-next-line camelcase
          nombre_uri,
          mostrar,
          icono,
          orden,
          admin,
          publico,
          // eslint-disable-next-line camelcase
          id_ruta_padre,
        },
        { transaction: t },
      );

      await ruta.addRols(roles, { transaction: t });
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

    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

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

    if (Number.isNaN(idRuta)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');

    if (roles.length === 0) {
      throw new BadRequestException(
        'BAD_REQUEST',
        400,
        'No se envío ningún rol',
      );
    }
    const ruta = await Ruta.findOne({ where: { id: idRuta } });
    const rutaRols = await ruta.addRols(roles);

    return res.status(HttpCode.HTTP_CREATED).json({
      ruta_rols: rutaRols,
    });
  }

  static async update(req, res) {
    const {
      nombre,
      uri,
      // eslint-disable-next-line camelcase
      nombre_uri,
      mostrar,
      icono,
      orden,
      admin,
      publico,
      // eslint-disable-next-line camelcase
      id_ruta_padre,
      // eslint-disable-next-line no-unused-vars
      roles,
    } = req.body;

    // eslint-disable-next-line no-unused-vars
    const ruta = await Ruta.update({
      nombre,
      uri,
      // eslint-disable-next-line camelcase
      nombre_uri,
      mostrar,
      icono,
      orden,
      admin,
      publico,
      // eslint-disable-next-line camelcase
      id_ruta_padre,
    }, {
      where: {
        id: req.params.id,
      },
    });

    await RutaRol.destroy({
      where: {
        id_ruta: req.params.id,
      },
    });

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < req.body.roles.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await RutaRol.create({
        id_ruta: req.params.id,
        id_rol: req.body.roles[i],
      });
    }

    return res.status(HttpCode.HTTP_OK)
      .json({ message: 'Datos actualizados con exito' });
  }

  static async destroy(req, res) {
    const { id } = req.body;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < req.body.id.length; i++) {
      if (Number.isNaN(id[i])) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');
      // eslint-disable-next-line no-await-in-loop
      await RutaRol.destroy({
        where: {
          id_ruta: id[i],
        },
      });
    }

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < req.body.id.length; i++) {
      if (Number.isNaN(id[i])) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');
      // eslint-disable-next-line no-await-in-loop
      await Ruta.destroy({
        where: {
          id: id[i],
        },
      });
    }

    return res.status(HttpCode.HTTP_OK)
      .json({
        message: 'Ruta Eliminada',
      });
  }

  static async destroyRutaRol(req, res) {
    const { id_ruta: idRuta } = req.params;
    const { roles } = req.body;

    if (Number.isNaN(idRuta)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');

    if (roles.length && roles.length <= 0) {
      throw new BadRequestException(
        'BAD_REQUEST',
        400,
        'No se envío ningún rol',
      );
    }
    await RutaRol.destroy({
      where: {
        id_ruta: idRuta,
        id_rol: {
          [Sequelize.Op.in]: roles,
        },
      },
    });
    return res.status(HttpCode.HTTP_OK).json({ message: 'roles eliminados' });
  }

  static async getRutas(req, res) {
    let filter = null;
    let data;
    if (req.headers.origin === process.env.FRONT_ADMIN_ADDRESS) {
      if (await Security.isGranted(req, 'SUPER-ADMIN') || await Security.isGranted(req, 'ROLE_ADMIN')) {
        filter = 'admin = true or publico = true';
      }
    }
    if (req.headers.origin === process.env.FRONT_USER_ADDRESS) {
      filter = 'admin = false or publico = true';
    }
    if (filter !== null) {
      data = await Ruta.findAll({
        include: [
          {
            model: Rol,
            attributes: [],
            include: [
              {
                model: Perfil,
                required: true,
                attributes: [],
              },
              {
                model: Usuario,
                required: true,
                attributes: [],
                where: { id: req.usuario.id },
              },
            ],
          },
        ],
        where: Sequelize.literal(filter),
        order: [
          ['orden', 'ASC'],
        ],
      });
    }
    return res.status(HttpCode.HTTP_OK).send(data);
  }
}
