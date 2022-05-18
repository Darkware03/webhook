import { Perfil, Rol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import DB from '../nucleo/DB.mjs';
import VerifyModel from '../utils/VerifyModel.mjs';

export default class PerfilController {
  static async index(req, res) {
    const perfiles = await Perfil.findAll({ include: [Rol] });
    return res.status(HttpCode.HTTP_OK).json(perfiles);
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
