import { Perfil, PerfilRol, Rol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import BaseError from '../../handlers/BaseError.mjs';
import DB from '../nucleo/DB.mjs';

export default class PerfilController {
  static async index(req, res) {
    const perfiles = await Perfil.findAll({ include: [Rol] });
    return res.status(HttpCode.HTTP_OK).json(perfiles);
  }

  static async store(req, res) {
    const { nombre, codigo } = req.body;
    const cod = await Perfil.findOne({ where: { codigo } });
    if (cod) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El codigo no puede ser igual a otro registrado con anterioridad'
      );
    }
    const perfil = await Perfil.create({
      nombre,
      codigo,
    });
    try {
      await perfil.setRols(req.body.roles);
      return res.status(HttpCode.HTTP_CREATED).json({
        id: perfil.id,
        nombre,
        codigo,
        roles: req.body.roles,
      });
    } catch (err) {
      perfil.destroy();
      throw err;
    }
  }

  static async show(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parámetro no es un id válido'
      );
    }

    const perfil = await Perfil.findOne({
      where: {
        id,
      },
    });
    return res.status(HttpCode.HTTP_OK).json(perfil);
  }

  static async update(req, res) {
    const { nombre, codigo } = req.body;
    const perfil = await Perfil.update(
      {
        nombre,
        codigo,
      },
      {
        where: {
          id: req.params.id,
        },
        returning: ['nombre', 'codigo'],
      }
    );
    return res.status(HttpCode.HTTP_OK).json(perfil[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parámetro no es un id válido'
      );
    }

    await Perfil.destroy({
      where: {
        id,
      },
    });
    return res.status(HttpCode.HTTP_OK).json({
      message: 'Perfil Eliminado',
    });
  }

  static async destroyMany(req, res) {
    const { perfiles } = req.body;
    const connection = DB.connection();
    const t = await connection.transaction();
    try {
      await PerfilRol.destroy(
        {
          where: { id_perfil: perfiles },
        },
        { transaction: t }
      );
      await Perfil.destroy(
        {
          where: {
            id: perfiles,
          },
        },
        { transaction: t }
      );
      await t.commit();
      return res
        .status(HttpCode.HTTP_OK)
        .json({ message: 'Se han eliminado con exito los perfiles' });
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  static async addPerfilRol(req, res) {
    const { id_perfil: idPerfil } = req.params;
    const { rol } = req.body;
    if (Number.isNaN(idPerfil)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parametro no es un id válido'
      );
    }
    const perfil = await Perfil.findOne({ where: { id: idPerfil } });
    const role = await Rol.findOne({ where: { id: rol } });
    if (!perfil) {
      throw new NotFoundException(
        'NOT_FOUND',
        404,
        'El usuario ingresado no coincide con ninguno registrado'
      );
    }
    if (!role) {
      throw new NotFoundException(
        'NOT_FOUND',
        404,
        'El rol ingresado no coincide con ninguno registrado'
      );
    }
    const perfilRols = await perfil.addRols(rol);
    if (!perfilRols) {
      //  304 Not Modified
      throw new BaseError('NOT_MODIFIED', 304, 'El rol ya pertenece a un perfil');
    }
    return res.status(HttpCode.HTTP_CREATED).json({
      perfil_rols: perfilRols,
    });
  }

  static async destroyPerfilRol(req, res) {
    const { id_perfil: idPerfil } = req.params;

    if (Number.isNaN(idPerfil)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parametro no es un id válido'
      );
    }

    await PerfilRol.destroy({
      where: {
        id_perfil: idPerfil,
      },
    });
    return res.status(HttpCode.HTTP_OK).json({ message: 'roles eliminados' });
  }
}
