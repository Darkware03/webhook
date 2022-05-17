import HttpCode from '../../configs/httpCode.mjs';
import TipoRol from '../models/TipoRol.mjs';

export default class TipoRolController {
  static async index(req, res) {
    const tipoRoles = await TipoRol.findAll();
    return res.status(HttpCode.HTTP_OK).json(tipoRoles);
  }
}
