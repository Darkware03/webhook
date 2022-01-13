import { RutaRol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';

export default class RutaRolController {
  static async index(req, res) {
    const rutasRoles = await RutaRol.findAll();
    return res.status(HttpCode.HTTP_OK).json(rutasRoles);
  }

  static async store(req, res) {
    const { id_ruta: idRuta, id_rol: idRol } = req.body;
    const rutaRol = await RutaRol.create({
      idRuta,
      idRol,
    });

    return res.status(HttpCode.HTTP_CREATED).json(rutaRol);
  }

  static async show(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const rutaRol = await RutaRol.findOne({
      where: {
        id,
      },
    });

    return res.status(HttpCode.HTTP_OK).json(rutaRol);
  }

  static async update(req, res) {
    const { id_ruta: idRuta, id_rol: idRol } = req.body;
    const rutaRol = await RutaRol.update({
      idRuta,
      idRol,
    }, {
      where: {
        id: req.params.id,
      },
      returning: ['id_ruta', 'id_rol'],
    });

    return res.status(HttpCode.HTTP_OK).json(rutaRol[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    await RutaRol.destroy({
      where: {
        id,
      },
    });

    return res.status(HttpCode.HTTP_OK).json({
      message: 'Ruta_Rol Eliminado',
    });
  }
}
