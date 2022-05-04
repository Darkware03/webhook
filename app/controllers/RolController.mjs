import { Rol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import VerifyModel from '../utils/VerifyModel.mjs';

export default class RolController {
  static async index(req, res) {
    const roles = await Rol.findAll();
    return res.status(HttpCode.HTTP_OK).json(roles);
  }

  static async store(req, res) {
    const { name } = req.body;

    const rol = await Rol.create({
      name,
    });
    return res.status(HttpCode.HTTP_CREATED).json(rol);
  }

  static async show(req, res) {
    const { id } = req.params;
    const rol = await VerifyModel.exist(Rol, id, 'El parámetro no es un id válido');
    return res.status(HttpCode.HTTP_OK).json(rol);
  }

  static async update(req, res) {
    const { name } = req.body;
    const { id } = req.params;
    const rol = await VerifyModel.exist(Rol, id, 'El id no es un id válido');
    await rol.update({
      name,
    }, {
      where: {
        id,
      },
      returning: ['name'],
    });
    return res.status(HttpCode.HTTP_OK).json(rol[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    const rol = await VerifyModel.exist(Rol, id, 'El id no es un id válido');

    await rol.destroy({
      where: {
        id,
      },
    });

    return res.status(HttpCode.HTTP_OK).json({
      message: 'Rol Eliminado',
    });
  }
}
