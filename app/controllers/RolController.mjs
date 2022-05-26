import { Op } from 'sequelize';
import { Rol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import VerifyModel from '../utils/VerifyModel.mjs';
import TipoRol from '../models/TipoRol.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';

export default class RolController {
  static async index(req, res) {
    const {
      page = 1,
      per_page: perPage = 10,
      paginacion = 'true',
      nombre,
    } = req.query;
    const filtro = {};
    const options = {};

    if (paginacion === 'true') {
      await VerifyModel.isValid(perPage, 'cantidad por pagina debe ser de tipo entero');
      await VerifyModel.isValid(page, 'pagina debe ser de tipo entero');

      options.offset = perPage * (page - 1);
      options.limit = Number(perPage);
      options.distinct = true;
    }
    if (nombre) filtro.name = { [Op.iLike]: `%${nombre}%` };

    const { count: totalRows, rows: roles } = await Rol.findAndCountAll({
      include: [TipoRol],
      where: filtro,
      ...options,
    });

    if (paginacion === 'true') {
      res.set({
        total_rows: Number(totalRows),
        page: Number(page),
        per_page: Number(perPage),
      });
    }

    return res.status(HttpCode.HTTP_OK).json(roles);
  }

  static async store(req, res) {
    const { name, id_tipo_rol: idTipoRol } = req.body;
    const existeRol = await Rol.findOne({
      where: { name: name.trim().toUpperCase() },
    });
    if (existeRol) throw new UnprocessableEntityException('Role ya existe');
    const rol = await Rol.create({
      name: name.trim().toUpperCase(),
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
    const { name, id_tipo_rol: idTipoRol } = req.body;
    const { id } = req.params;
    await VerifyModel.exist(Rol, id, 'El rol no ha sido encontrado');

    const rol = await Rol.update({
      name, id_tipo_rol: idTipoRol,
    }, {
      where: {
        id,
      },
      returning: ['name', 'id_tipo_rol'],
    });
    return res.status(HttpCode.HTTP_OK).json(rol[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    const rol = await VerifyModel.exist(Rol, id, 'El rol no ha sido encontrado');
    await rol.destroy();
    return res.status(HttpCode.HTTP_OK).json({ message: 'Rol eliminado' });
  }
}
