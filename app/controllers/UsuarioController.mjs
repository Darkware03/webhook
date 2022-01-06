import HttpCode from "../../configs/httpCode.mjs";
import bcrypt from "bcryptjs";
import DB from "../nucleo/DB.mjs";
import Sequelize from "sequelize";
import {
  Usuario,
  UsuarioRol,
  UsuarioPerfil,
  Perfil,
  Rol,
} from "../models/index.mjs";

export default class UsuarioController {
  static async index(req, res) {
    const usuarios = await Usuario.findAll({});
    return res.status(HttpCode.HTTP_OK).json(usuarios);
  }

  static async store(req, res) {
    const connection = DB.connection();
    const t = await connection.transaction();
    const { perfiles, roles, email, password, is_suspended } = req.body;
    const salt = bcrypt.genSaltSync();
    const password_crypt = bcrypt.hashSync(password, salt);

    if (perfiles.length === 0 && roles.length === 0) {
      return res.status(422).json({
        message: "El usuario debe contener al menos un perfil o un rol",
      });
    }

    try {
      const usuario = await Usuario.create(
        { email, is_suspended, password: password_crypt },
        { transaction: t }
      );

      await usuario.addPerfils(perfiles, { transaction: t });

      const pf = await usuario.getPerfils({
        transaction: t,
        attributes: ["id", "nombre"],
      });

      let arrPerfiles = pf.map(({ dataValues }) => ({
        id: dataValues.id,
        nombre: dataValues.nombre,
      }));

      await usuario.addRols(roles, { transaction: t });
      let rl = await usuario.getRols({ transaction: t });

      let arrRoles = rl.map(({ dataValues }) => ({
        id: dataValues.id,
        name: dataValues.name,
      }));
      const id_usuario = usuario.id; 
      await t.commit();

      const us = await Usuario.findOne({
        where:{
          id: id_usuario
        },
        include: [
          {
            model: Perfil,
            attributes: ['id', 'nombre'],
            through: {
              attributes: []
            }
          },
          {
            model: Rol,
            attributes: ['id', 'name'],
            through: {
              attributes: []
            }
          }
        ]
      })
      const { Perfils: perfiles2, Rols: roles2 } = us.dataValues;

      return res.status(HttpCode.HTTP_CREATED).json({
        id: usuario.id,
        email: usuario.email,
        perfiles: arrPerfiles,
        roles: arrRoles,
        perfiles2,
        roles2
      });
    } catch (e) {
      await t.rollback();
      return res.status(500).json({ message: e });
    }
  }

  static async update(req, res) {
    const { email } = req.body;

    const usuario = await Usuario.update(
      {
        email,
      },
      {
        where: {
          id: req.params.id,
        },
        returning: ["id", "email"],
      }
    );

    return res.status(HttpCode.HTTP_OK).json(usuario[1]);
  }

  static async destroy(req, res) {
    await Usuario.update(
      {
        active: false,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    return res.status(HttpCode.HTTP_OK).json({
      message: "Usuario Eliminado",
    });
  }

  static async show(req, res) {
    const { id } = req.params;

    const user = await Usuario.findOne({
      where: {
        id,
      },
      attributes: ["id", "email"],
      include: [
        {
          model: Perfil,
          attributes: ["id", "nombre"],
          through: {
            attributes: [],
          },
        },
        {
          model: Rol,
          attributes: ["id", "name"],
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!user) {
      return res.status(HttpCode.HTTP_OK).json({
        message: "No encontrado",
      });
    }

    const { Perfils: perfiles, Rols: roles, ...usuario } = user.dataValues;
    res.status(HttpCode.HTTP_OK).json({ ...usuario, perfiles, roles });
  }

  static async addUserProfile(req, res) {
    const { id_usuario } = req.params;
    const { perfiles } = req.body;

    if (perfiles.length === 0) {
      return res.status(422).json({
        message: "No se envió ningún perfil",
      });
    }
    const user = await Usuario.findOne({ where: { id: id_usuario } });
    const user_profils = await user.addPerfils(perfiles);

    return res.status(HttpCode.HTTP_CREATED).json({
      user,
      user_profils,
    });
  }

  static async addUserRole(req, res) {
    const { id_usuario } = req.params;
    const { roles } = req.body;

    if (roles.length === 0) {
      return res.status(422).json({
        message: "No se envió ningún rol",
      });
    }
    const user = await Usuario.findOne({ where: { id: id_usuario } });
    const user_rols = await user.addRols(roles);

    return res.status(HttpCode.HTTP_CREATED).json({
      user_rols,
    });
  }

  static async destroyUserPerfil(req, res) {
    const { id_usuario } = req.params;
    const { perfiles } = req.body;
    if (perfiles.length && perfiles.length <= 0) {
      return res.status(422).json({ message: "Sin perfiles" });
    }
    await UsuarioPerfil.destroy({
      where: {
        id_usuario,
        id_perfil: {
          [Sequelize.Op.in]: perfiles,
        },
      },
    });
    return res
      .status(HttpCode.HTTP_OK)
      .json({ message: "Perfiles eliminados" });
  }

  static async destroyUserRol(req, res) {
    const { id_usuario } = req.params;
    const { roles } = req.body;
    if (roles.length && roles.length <= 0) {
      return res.status(422).json({ message: "Sin roles" });
    }
    await UsuarioRol.destroy({
      where: {
        id_usuario,
        id_rol: {
          [Sequelize.Op.in]: roles,
        },
      },
    });
    return res.status(HttpCode.HTTP_OK).json({ message: "roles eliminados" });
  }
}
