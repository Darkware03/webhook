import { Rol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';
import TipoRol from '../models/TipoRol.mjs';
// import NotFoundExeption from '../../handlers/UnprocessableEntityException.mjs';

export default class RolController {
  static async index(req, res) {
    const roles = await Rol.findAll({ include: [TipoRol] });
    return res.status(HttpCode.HTTP_OK).json(roles);
  }

  static async store(req, res) {
    const { name, idTipoRol } = req.body;

    const verficarRol = await TipoRol.findByPk(idTipoRol);

    if (!verficarRol) {
      throw new BadRequestException('No exite el idTipoRol');
    }
    const rol = await Rol.create({
      name,
      id_tipo_rol: idTipoRol,
    });

    return res.status(HttpCode.HTTP_CREATED).json(rol);
  }

  static async show(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('El parámetro no es un id válido');

    const rol = await Rol.findOne({
      where: {
        id,
      },
      include: [TipoRol],
    });

    return res.status(HttpCode.HTTP_OK).json(rol);
  }

  static async update(req, res) {
    const { name, idTipoRol } = req.body;
    const { id } = req.params;

    const verficarRol = await TipoRol.findByPk(idTipoRol);

    if (!verficarRol) {
      throw new BadRequestException('No exite el idTipoRol');
    }

    if (Number.isNaN(id)) throw new UnprocessableEntityException('El parametro no es un id válido');
    const rol = await Rol.update({
      name,
      id_tipo_rol: idTipoRol,
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
    if (Number.isNaN(id)) throw new UnprocessableEntityException('El parametro no es un id válido');
    try {
      await Rol.destroy({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new BadRequestException('No se puede eliminar el rol seleccionado');
    }

    return res.status(HttpCode.HTTP_OK).json({
      message: 'Rol Eliminado',
    });
  }
}
