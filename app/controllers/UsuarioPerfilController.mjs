import { UsuarioPerfil } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';

export default class UsuarioPerfilController {
  static async index(req, res) {
    const usuariosPerfil = await UsuarioPerfil.findAll();
    return res.status(HttpCode.HTTP_OK).json(usuariosPerfil);
  }

  static async store(req, res) {
    const { id_perfil: idPerfil, id_usuario: idUsuario } = req.body;

    const usuarioPerfil = await UsuarioPerfil.create({
      id_perfil: idPerfil,
      id_usuario: idUsuario,
    });

    return res.status(HttpCode.HTTP_CREATED).json(usuarioPerfil);
  }

  static async show(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const usuarioPerfil = await UsuarioPerfil.findOne({
      where: {
        id,
      },
    });

    return res.status(HttpCode.HTTP_OK).json(usuarioPerfil);
  }

  static async update(req, res) {
    const { id_perfil: idPerfil, id_usuario: idUsuario } = req.body;
    const usuarioPerfil = await UsuarioPerfil.update({
      id_perfil: idPerfil,
      id_usuario: idUsuario,
    }, {
      where: {
        id: req.params.id,
      },
      returning: ['id_perfil', 'id_usuario'],
    });
    return res.status(HttpCode.HTTP_OK).json(usuarioPerfil[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    await UsuarioPerfil.update({
      active: false,
    }, {
      where: {
        id,
      },
    });

    return res.status(HttpCode.HTTP_OK).json({
      message: 'Usuario Perfil Eliminado',
    });
  }
}
