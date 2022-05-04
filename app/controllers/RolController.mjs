import { Rol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import VerifyModel from '../utils/VerifyModel.mjs';
import TipoRol from '../models/TipoRol.mjs';

export default class RolController {
  static async index(req, res) {
    const roles = await Rol.findAll({ include: [TipoRol] });
    return res.status(HttpCode.HTTP_OK).json(roles);
  }

  static async store(req, res) {
    const { name, idTipoRol } = req.body;
    await VerifyModel.exist(TipoRol, idTipoRol, 'El tipo de rol no se ha encontrado');

    const rol = await Rol.create({
      name,
      id_tipo_rol: idTipoRol,
    });
    return res.status(HttpCode.HTTP_CREATED).json(rol);
  }

  static async show(req, res) {
    const { id } = req.params;
    const rol = await VerifyModel.exist(Rol, id, 'El rol no ha sido encontrado');
    return res.status(HttpCode.HTTP_OK).json(rol);
  }

  static async update(req, res) {
    const { name, idTipoRol } = req.body;
    const { id } = req.params;
    await VerifyModel.exist(Rol, id, 'El rol no ha sido encontrado');

    const rol = await Rol.update({ name, id_tipo_rol: idTipoRol }, { returning: ['name', 'id_tipo_rol'] });
    return res.status(HttpCode.HTTP_OK).json(rol);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    const rol = await VerifyModel.exist(Rol, id, 'El rol no ha sido encontrado');
    rol.destroy();
    return res.status(HttpCode.HTTP_OK).json({ message: 'Rol eliminado' });
  }
}
