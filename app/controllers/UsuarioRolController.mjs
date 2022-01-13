import { UsuarioRol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';

export default class UsuarioRolController {
  static async index(req, res) {
    const usuarioRoles = await UsuarioRol.findAll();
    return res.status(HttpCode.HTTP_OK).json(usuarioRoles);
  }

  static async store(req, res) {
    const { id_usuario: idUsuario, id_rol: idRol } = req.body;
    const userRol = await UsuarioRol.create({
      id_usuario: idUsuario,
      id_rol: idRol,
    });

    return res.status(HttpCode.HTTP_CREATED).json(userRol);
  }

  static async show(req, res) {
    const { id_usuario: idUsuario, id_rol: idRol } = req.query;

    if (Number.isNaN(idUsuario) || Number.isNaN(idRol)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const userRol = await UsuarioRol.findOne({
      where: {
        id_usuario: idUsuario,
        id_rol: idRol,
      },
    });

    return res.status(HttpCode.HTTP_OK).json(userRol);
  }

  static async update(req, res) {
    const { id_usuario: idUsuario, id_rol: idRol } = req.query;

    if (Number.isNaN(idUsuario) || Number.isNaN(idRol)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const userRolFind = await UsuarioRol.findOne({
      where: {
        id_usuario: idUsuario,
        id_rol: idRol,
      },
    });
    if (!userRolFind) {
      return res.status(HttpCode.HTTP_UNPROCESSABLE_ENTITY).json({ mjs: 'No encontrado' });
    }
    const userRol = await UsuarioRol.update({
      id_usuario: req.body.id_usuario,
      id_rol: req.body.id_rol,
    }, {
      where: {
        id_usuario: idUsuario,
        id_rol: idUsuario,
      },
      returning: ['id_usuario', 'id_rol'],
    });

    return res.status(HttpCode.HTTP_OK).json(userRol[1]);
  }

  static async destroy(req, res) {
    const { id_usuario: idUsuario, id_rol: idRol } = req.query;
    if (Number.isNaN(idUsuario) || Number.isNaN(idRol)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    await UsuarioRol.destroy({
      where: {
        id_usuario: idUsuario,
        id_rol: idRol,
      },
    });

    return res.status(HttpCode.HTTP_OK).json({
      message: 'Usuario-Rol Eliminado',
    });
  }
}
