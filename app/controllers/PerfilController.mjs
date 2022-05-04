import { Perfil, PerfilRol, Rol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import BaseError from '../../handlers/BaseError.mjs';
import DB from '../nucleo/DB.mjs';
import VerifyModel from '../utils/VerifyModel.mjs';

export default class PerfilController {
  static async index(req, res) {
    const perfiles = await Perfil.findAll({ include: [Rol] });
    return res.status(HttpCode.HTTP_OK).json(perfiles);
  }

  static async store(req, res) {
    const { nombre, codigo } = req.body;
    const t = await DB.connection().transaction();

    try {
      const perfil = await Perfil.create({
        nombre,
        codigo,
      }, { transaction: t });

      await perfil.setRols(req.body.roles, { transaction: t });

      await t.commit();

      return res.status(HttpCode.HTTP_CREATED).json({
        id: perfil.id,
        nombre,
        codigo,
        roles: req.body.roles,
      });
    } catch (err) {
      t.rollback();
      throw err;
    }
  }

  static async show(req, res) {
    const { id } = req.params;
    const perfil = await VerifyModel.exist(Perfil, id, 'El perfil no ha sido encontrado');
    return res.status(HttpCode.HTTP_OK).json(perfil);
  }

  static async update(req, res) {
    const { nombre, codigo } = req.body;
    const perfil = await Perfil.update(
      {
        nombre,
        codigo,
      },
      {
        where: {
          id: req.params.id,
        },
        returning: ['nombre', 'codigo'],
      },
    );
    return res.status(HttpCode.HTTP_OK).json(perfil[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    const perfil = await VerifyModel.exist(Perfil, id, 'El perfil no ha sido encontado');

    await perfil.destroy();
    return res.status(HttpCode.HTTP_OK).json({
      message: 'Perfil Eliminado',
    });
  }

  static async destroyMany(req, res) {
    const { perfiles } = req.body;
    const connection = DB.connection();
    const t = await connection.transaction();
    try {
      await PerfilRol.destroy(
        {
          where: { id_perfil: perfiles },
        },
        { transaction: t },
      );
      await Perfil.destroy(
        {
          where: {
            id: perfiles,
          },
        },
        { transaction: t },
      );
      await t.commit();
      return res
        .status(HttpCode.HTTP_OK)
        .json({ message: 'Se han eliminado con exito los perfiles' });
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  static async addPerfilRol(req, res) {
    const { id_perfil: idPerfil } = req.params;
    const { rol } = req.body;
    const perfil = await VerifyModel.exist(Perfil, idPerfil, 'El perfil no ha sido encontrado');

    await VerifyModel.exist(Rol, rol, 'El rol no ha sido encontrado');

    const perfilRols = await perfil.addRols(rol);
    if (!perfilRols) {
      //  304 Not Modified
      throw new BaseError('NOT_MODIFIED', 304, 'El rol ya pertenece a un perfil');
    }
    return res.status(HttpCode.HTTP_CREATED).json({
      perfil_rols: perfilRols,
    });
  }

  static async destroyPerfilRol(req, res) {
    const { id_perfil: idPerfil, id_rol: idRol } = req.params;

    await VerifyModel.exist(Perfil, idPerfil, 'El perfil no ha sido encontrado');
    await VerifyModel.exist(Rol, idRol, 'El rol no ha sido encontrado');

    await PerfilRol.destroy({
      where: {
        id_perfil: idPerfil,
        id_rol: idRol,
      },
    });
    return res.status(HttpCode.HTTP_OK).json({ message: 'roles eliminados' });
  }
}
