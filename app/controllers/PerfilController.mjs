import { Perfil, PerfilRol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';

export default class PerfilController {
  static async index(req, res) {
    const perfiles = await Perfil.findAll();
    return res.status(HttpCode.HTTP_OK).json(perfiles);
  }

  static async store(req, res) {
    const { nombre, codigo } = req.body;

    const perfil = await Perfil.create({
      nombre,
      codigo,
    });
    /** Validar que si no trae ningun rol no asignarle nada y devolver el perfil creado exitoso */
    if (req.body.roles == null) { return res.status(HttpCode.HTTP_CREATED).json(perfil); }
    req.body.roles.forEach(async (rol) => {
      await PerfilRol.create({
        id_perfil: perfil.id,
        id_rol: rol,
      });
    });
    return res.status(HttpCode.HTTP_CREATED).json(perfil);
  }

  static async show(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const perfil = await Perfil.findOne({
      where: {
        id,
      },
    });
    return res.status(HttpCode.HTTP_OK).json(perfil);
  }

  static async update(req, res) {
    const { nombre, codigo } = req.body;
    const perfil = await Perfil.update({
      nombre,
      codigo,
    }, {
      where: {
        id: req.params.id,
      },
      returning: ['nombre', 'codigo'],
    });
    return res.status(HttpCode.HTTP_OK).json(perfil[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    await Perfil.destroy({
      where: {
        id,
      },
    });
    return res.status(HttpCode.HTTP_OK).json({
      message: 'Perfil Eliminado',
    });
  }

  static async updatePerfilRol(req, res) {
    const { id } = req.params;
    const perfil = await Perfil.findOne({
      where: {
        id,
      },
    });
    if (perfil) {
      PerfilRol.destroy({
        where: {
          id_perfil: req.params.id,
        },
      });
      req.body.roles.forEach(async (rol) => {
        await PerfilRol.create({
          id_perfil: req.params.id,
          id_rol: rol,
        });
      });
    } else { throw new NotFoundException('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, 'No se encontro ningun perfil'); }
    return res.status(HttpCode.HTTP_OK).json({ message: 'Roles actualizados con exito' });
  }
}
