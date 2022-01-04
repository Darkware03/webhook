import {
  Usuario,
  UsuarioRol,
  UsuarioPerfil,
  Perfil,
  Rol,
} from "../models/index.mjs";
import sequelize from "sequelize";
import HttpCode from "../../configs/httpCode.mjs";
import bcrypt from "bcryptjs";
import WS from "../services/WS.mjs";
import DB from "../nucleo/DB.mjs";

export default class UsuarioController {
  static async index(req, res) {
    const usuarios = await Usuario.findAll();
    return res.status(HttpCode.HTTP_OK).json(usuarios);
  }

  static async store(req, res) {
    const connection = DB.connection();
    const t = await connection.transaction();
    let arrPerfiles = [],
      arrRoles = [];
    const {
      perfiles,
      roles,
      name,
      last_name,
      email,
      password,
      active = true,
    } = req.body;

    const salt = bcrypt.genSaltSync();
    const password_crypt = bcrypt.hashSync(password, salt);

    if (perfiles.length === 0 && roles.length === 0) {
      return res.status(422).json({
        message: "El usuario debe contener al menor un perfil o un rol",
      });
    }

    try {
      const usuario = await Usuario.create(
        {
          name,
          last_name,
          email,
          password: password_crypt,
          active,
        },
        { transaction: t }
      );

      if (perfiles.length > 0) {
        let exists = null;
        for (let index = 0; index < perfiles.length; index++) {
          exists = await Perfil.findOne({
            where: {
              id: perfiles[index],
            },
          });
          if (exists) {
            await UsuarioPerfil.create(
              {
                id_perfil: perfiles[index],
                id_usuario: usuario.id,
              },
              { transaction: t }
            );
            let { id, nombre } = exists;
            arrPerfiles.push({ id, nombre });
          } else {
            return res.status(422).json({
              message: `No se encontro el perfil con id ${perfiles[index]}`,
            });
          }
        }
      }
      if (roles.length > 0) {
        for (let index = 0; index < roles.length; index++) {
          let exist = await Rol.findOne({
            where: {
              id: roles[index],
            },
          });
          if (exist) {
            await UsuarioRol.create(
              {
                id_rol: roles[index],
                id_usuario: usuario.id,
              },
              { transaction: t }
            );
            let { id, name: nombre } = exist;
            arrRoles.push({ id, nombre });
          } else {
            return res
              .status(422)
              .json({ message: `Id Rol ${roles[index]} no encontrado` });
          }
        }
      }
      await t.commit();
      const { id, last_login, is_suspended } = usuario;
      return res.status(HttpCode.HTTP_CREATED).json({
        id,
        email: usuario.email,
        perfiles: arrPerfiles,
        roles: arrRoles,
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: "Error en procesar la petición" });
    }
  }
  static async show(req, res) {
    const usuario = await Usuario.findOne({
      where: {
        id: req.params.id,
      },
    });

    return res.status(HttpCode.HTTP_OK).json(usuario);
  }

  static async update(req, res) {
    const { name, last_name, email } = req.body;

    const usuario = await Usuario.update(
      {
        name,
        last_name,
        email,
      },
      {
        where: {
          id: req.params.id,
        },
        returning: ["name", "last_name", "email"],
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

  static async userInfo(req, res) {
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

    const { Perfils: perfiles, Rols: roles, ...usuario } = user.dataValues;
    res.status(HttpCode.HTTP_OK).json({ ...usuario, perfiles, roles });
  }
}
