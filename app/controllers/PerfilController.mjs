import { Op } from 'sequelize';
import { Perfil, Rol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import DB from '../nucleo/DB.mjs';
import VerifyModel from '../utils/VerifyModel.mjs';

export default class PerfilController {
  static async index(req, res) {
    const {
      page = 1,
      per_page: perPage = 10,
      nombre,
      codigo,
    } = req.query;

    const filtro = {};
    if (nombre) filtro.nombre = { [Op.iLike]: `%${nombre}%` };
    if (codigo) filtro.codigo = { [Op.iLike]: `%${codigo}%` };
    const { count: totalRows, rows: perfiles } = await Perfil.findAndCountAll({
      include: [{ model: Rol, required: true }],
      where: filtro,
      distinct: true,
      limit: perPage,
      offset: perPage * (page - 1),
    });
    return res.status(HttpCode.HTTP_OK).json({
      page,
      per_page: Number(perPage),
      total_rows: totalRows,
      body: perfiles,
    });
  }

  static async store(req, res) {
    const { nombre, codigo, roles } = req.body;
    const transaction = await DB.connection().transaction();

    try {
      const perfil = await Perfil.create({
        nombre,
        codigo,
      }, { transaction });

      await perfil.setRols(roles, { transaction });

      await transaction.commit();

      return res.status(HttpCode.HTTP_CREATED).json({
        id: perfil.id,
        nombre,
        codigo,
        roles,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async show(req, res) {
    const { id } = req.params;
    const perfil = await VerifyModel.exist(Perfil, id, 'El perfil no ha sido encontrado', {
      include: {
        model: Rol,
        through: { attributes: [] },
      },
    });
    return res.status(HttpCode.HTTP_OK).json(perfil);
  }

  static async update(req, res) {
    const { nombre, codigo, roles } = req.body;
    const { id } = req.params;
    const transaction = await DB.connection().transaction();
    try {
      const perfil = await VerifyModel.exist(Perfil, id, 'Perfil no encontrado');
      await perfil.update({ nombre, codigo }, {
        transaction,
      });
      await perfil.setRols(roles, {
        transaction,
      });
      await transaction.commit();
      return res.status(HttpCode.HTTP_OK).json(perfil);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }
}
