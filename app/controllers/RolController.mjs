import { Rol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import DB from '../nucleo/DB.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
// import NotFoundExeption from '../../handlers/UnprocessableEntityException.mjs';

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
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const rol = await Rol.findOne({
      where: {
        id,
      },
    });

    return res.status(HttpCode.HTTP_OK).json(rol);
  }

  static async update(req, res) {
    const { name } = req.body;
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');
    const rol = await Rol.update({
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
    const { roles } = req.body;
    const connection = DB.connection();
    const t = await connection.transaction();
    try {
      await Rol.destroy({
        where: {
          id: roles,
        },
      }, { transaction: t });
      await t.commit();
      return res.status(HttpCode.HTTP_OK).json({ message: 'ok' });
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }
}
