import Sequelize from 'sequelize';
import { Perfil, PerfilRol, Rol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import DB from '../nucleo/DB.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';

export default class PerfilController {
  static async index(req, res) {
    const perfiles = await Perfil.findAll({ include: [Rol] });
    return res.status(HttpCode.HTTP_OK).json(perfiles);
  }

  static async store(req, res) {
    const { nombre, codigo } = req.body;
    const cod = await Perfil.findOne({ where: { codigo } });
    if (cod) {
      throw new NotFoundException(
        'BAD_REQUEST',
        HttpCode.HTTP_BAD_REQUEST,
        'El codigo no puede ser igual a otro registrado con anterioridad'
      );
    }
    const perfil = await Perfil.create({
      nombre,
      codigo,
    });
    try {
      /** Validar que si no trae ningun rol no asignarle nada y devolver el perfil creado exitoso */
      if (req.body.roles == null) {
        throw new NotFoundException(
          'BAD_REQUEST',
          HttpCode.HTTP_BAD_REQUEST,
          'El perfil debe tener al menos un rol asignado'
        );
      }
      await perfil.setRols(req.body.roles);
      return res.status(HttpCode.HTTP_CREATED).json({
        id: perfil.id,
        nombre,
        codigo,
        roles: req.body.roles,
      });
    } catch (e) {
      perfil.destroy();
      throw new NotFoundException(
        'BAD_REQUEST',
        HttpCode.HTTP_BAD_REQUEST,
        'Uno o mas roles no se encuentran registrados'
      );
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
      throw new UnprocessableEntityException(
        'Error al eliminar perfiles',
        HttpCode.HTTP_BAD_REQUEST,
        'Uno o mas perfiles proporcionados no son validos'
      );
    }
  }

  static async addPerfilRol(req, res) {
    const { id_perfil: idPerfil } = req.params;
    const { roles } = req.body;

    if (Number.isNaN(idPerfil)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parametro no es un id válido'
      );
    }

    if (roles.length === 0) {
      throw new BadRequestException('BAD_REQUEST', 400, 'No se envío ningún rol');
    }
    const perfil = await Perfil.findOne({ where: { id: idPerfil } });
    const perfilRols = await perfil.addRols(roles);

    return res.status(HttpCode.HTTP_CREATED).json({
      perfil_rols: perfilRols,
    });
  }

  static async destroyPerfilRol(req, res) {
    const { id_perfil: idPerfil } = req.params;
    const { roles } = req.body;

    if (Number.isNaN(idPerfil)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parametro no es un id válido'
      );
    }

    if (roles.length && roles.length <= 0) {
      throw new BadRequestException('BAD_REQUEST', 400, 'No se envío ningún rol');
    }
    await PerfilRol.destroy({
      where: {
        id_perfil: idPerfil,
        id_rol: {
          [Sequelize.Op.notIn]: roles,
        },
      },
    });
    return res.status(HttpCode.HTTP_OK).json({ message: 'roles eliminados' });
  }
}
