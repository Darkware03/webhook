import HttpCode from "../../configs/httpCode.mjs";
import bcrypt from "bcryptjs";
import DB from "../nucleo/DB.mjs";
import Sequelize from "sequelize";
import BadRequestException from "../../handlers/BadRequestException.mjs"; 
import NotFoundException from "../../handlers/NotFoundExeption.mjs"

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
      throw new BadRequestException('BAD_REQUEST', 400, 'El usuario debe tener al menos un perfil o un rol'); 
    }

    try {
      const usuario = await Usuario.create(
        { email, is_suspended, password: password_crypt },
        { transaction: t }
      );

      await usuario.addPerfils(perfiles, { transaction: t });
      await usuario.addRols(roles, { transaction: t });
      const id_usuario = usuario.id;
      await t.commit();

      const us = await getById(id_usuario);
      const { Perfils, Rols } = us.dataValues;

      return res.status(HttpCode.HTTP_CREATED).json({
        id: usuario.id,
        email: usuario.email,
        perfiles: Perfils,
        roles: Rols
      });
    } catch (e) {
      console.log(e);
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
    const user = await getById(id);

    if (!user) {
      throw new NotFoundException(); 
    }
    const { Perfils: perfiles, Rols: roles, ...usuario } = user.dataValues;
    res.status(HttpCode.HTTP_OK).json({ ...usuario, perfiles, roles });
  }

  static async addUserProfile(req, res) {
    const { id_usuario } = req.params;
    const { perfiles } = req.body;

    if (perfiles.length === 0) {
      throw new BadRequestException('BAD_REQUEST', 400, 'No se envío ningún perfil'); 
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
      throw new BadRequestException('BAD_REQUEST', 400, 'No se envío ningún rol'); 
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
      throw new BadRequestException('BAD_REQUEST', 400, 'No se envío ningún perfil'); 
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
      throw new BadRequestException('BAD_REQUEST', 400, 'No se envío ningún rol'); 
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

function getById(id) {
  return Usuario.findOne({
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
}
