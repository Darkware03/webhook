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
    const { email, password } = req.body;
    const salt = bcrypt.genSaltSync();
    const password_crypt = bcrypt.hashSync(password, salt);

    const usuario = await Usuario.create({
      email,
      password: password_crypt,
    });

    WS.emit("new_user", usuario);

    return res.status(HttpCode.HTTP_CREATED).json(usuario);
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

  static async storeUserProfileRole(req, res) {
    const connection = DB.connection();
    const t = await connection.transaction();
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
        for (let index = 0; index < perfiles.length; index++) {
          let exist = await Perfil.findOne({
            where: {
              id: perfiles[index],
            },
          });
          if (exist) {
            await UsuarioPerfil.create(
              {
                id_perfil: perfiles[index],
                id_usuario: usuario.id,
              },
              { transaction: t }
            );
          } else {
            return res
              .status(422)
              .json({ message: `Id perfil ${id_perfil} no encontrado` });
          }
        }
      }
      if (roles.length > 0) {
        for (let index = 0; index < roles.length; index++) {
          let exist = await Rol.findOne({
            where: {
              id: roles[index],
            }
          });
          if (exist) {
            await UsuarioRol.create(
              {
                id_rol: roles[index],
                id_usuario: usuario.id,
              },
              { transaction: t }
            );
          } else {
            return res
              .status(422)
              .json({ message: `Id Rol ${id_rol} no encontrado` });
          }
        }
      }
      await t.commit();
    } catch (error) {
      console.log(error);
      await t.rollback();
      return res.status(500).json({ "message": error });
    }
  }
}
