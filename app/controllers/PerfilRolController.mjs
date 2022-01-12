import { PerfilRol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';

export default class PerfilController {
  static async index(req, res) {
    const perfilesRoles = await PerfilRol.findAll();
    return res.status(HttpCode.HTTP_OK).json(perfilesRoles);
  }

  static async store(req, res) {
    const { id_perfil: idPerfil, id_rol: idRol } = req.body;

    const perfilRol = await PerfilRol.create({
      idPerfil,
      idRol,
    }, { fields: ['id_perfil', 'id_rol'] });

    return res.status(HttpCode.HTTP_CREATED).json(perfilRol);
  }

  static async show(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const perfilRol = await PerfilRol.findOne({
      where: {
        id,
      },
    });
    return res.status(HttpCode.HTTP_OK).json(perfilRol);
  }

  static async update(req, res) {
    const { id_perfil: idPerfil, id_rol: idRol } = req.body;

    const perfilRol = await PerfilRol.update({
      idPerfil,
      idRol,
    }, {
      where: {
        id: req.params.id,
      },
      returning: ['id_perfil', 'id_rol'],
    });
    return res.status(HttpCode.HTTP_OK).json(perfilRol[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    await PerfilRol.destroy({
      where: {
        id,
      },
    });
    return res.status(HttpCode.HTTP_OK).json({
      message: 'Perfil Rol Eliminado',
    });
  }
}
