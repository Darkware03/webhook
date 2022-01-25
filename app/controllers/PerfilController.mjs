import { Perfil, PerfilRol } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import DB from '../nucleo/DB.mjs';

export default class PerfilController {
  static async index(req, res) {
    const perfiles = await Perfil.findAll();
    return res.status(HttpCode.HTTP_OK).json(perfiles);
  }

  static async store(req, res) {
    const { nombre, codigo } = req.body;

    const perfil = await Perfil.create({
      nombre,
      codigo,
    });
    /** Validar que si no trae ningun rol no asignarle nada y devolver el perfil creado exitoso */
    if (req.body.roles == null) { return res.status(HttpCode.HTTP_CREATED).json(perfil); }
    req.body.roles.forEach(async (rol) => {
      await PerfilRol.create({
        id_perfil: perfil.id,
        id_rol: rol,
      });
    });
    return res.status(HttpCode.HTTP_CREATED).json({
      id: perfil.id,
      nombre,
      codigo,
      roles: req.body.roles,
    });
  }

  static async show(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const perfil = await Perfil.findOne({
      where: {
        id,
      },
    });
    return res.status(HttpCode.HTTP_OK).json(perfil);
  }

  static async update(req, res) {
    const { nombre, codigo } = req.body;
    await Perfil.update({
      nombre,
      codigo,
    }, {
      where: {
        id: req.params.id,
      },
    });
    if (req.body.roles == null) { return res.status(HttpCode.HTTP_OK).json({ message: 'Perfil actualizado con exito' }); }
    const roles = [];
    req.body.roles.forEach(async (rol) => {
      const x = { id_rol: rol, id_perfil: parseInt(req.params.id, 10) };
      roles.push(x);
    });
    const connection = DB.connection();
    const t = await connection.transaction();
    /** capturo los id de los roles que estan relacionados antes del drop */
    const anterior = await PerfilRol.findAll({ where: { id_perfil: req.params.id } });
    try {
      await PerfilRol.destroy({
        where: {
          id_perfil: req.params.id,
        },
      }, { transaction: t });
      await PerfilRol.bulkCreate(
        roles,
        { transaction: t },
      );
      await t.commit();
      return res.status(HttpCode.HTTP_OK).json({ message: 'Perfil actualizado con exito' });
    } catch (e) {
      await t.rollback();
      /** Se crean de nuevo si existe alguna falla */
      anterior.forEach(async (x) => {
        await PerfilRol.create({
          id_perfil: req.params.id,
          id_rol: x.dataValues.id_rol,
        });
      });

      return res.status(HttpCode.HTTP_OK).json({ message: 'Error uno o mas roles no se encuentran registrados' });
    }
  }

  static async destroy(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    await Perfil.destroy({
      where: {
        id,
      },
    });
    return res.status(HttpCode.HTTP_OK).json({
      message: 'Perfil Eliminado',
    });
  }
}
