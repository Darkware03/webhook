/* eslint-disable no-unused-vars */
import bcrypt from 'bcryptjs';
import Sequelize from 'sequelize';
import moment from 'moment-timezone';
import jwt from 'jsonwebtoken';
import HttpCode from '../../configs/httpCode.mjs';
import DB from '../nucleo/DB.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import Auth from '../utils/Auth.mjs';

import {
  Usuario,
  UsuarioRol,
  UsuarioPerfil,
  Perfil,
  Rol,
} from '../models/index.mjs';
import Mailer from '../services/mailer.mjs';

export default class UsuarioController {
  static async index(req, res) {
    const usuarios = await Usuario.findAll({});
    return res.status(HttpCode.HTTP_OK).json(usuarios);
  }

  static async store(req, res) {
    const connection = DB.connection();
    const t = await connection.transaction();
    const {
      perfiles, roles, email, password,
    } = req.body;
    const salt = bcrypt.genSaltSync();
    const passwordCrypt = bcrypt.hashSync(password, salt);

    try {
      if (perfiles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < perfiles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          const perfil = await Perfil.findOne({ where: { id: perfiles[index] } });
          if (!perfil) throw new NotFoundException('NOT_FOUND', 404, `No se encontró el perfil con id ${perfiles[index]}`);
        }
      }
      if (roles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < roles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          const rol = await Rol.findOne({ where: { id: roles[index] } });
          if (!rol) throw new NotFoundException('NOT_FOUND', 404, `No se encontró el rol con id ${roles[index]}`);
        }
      }

      const usuario = await Usuario.create(
        { email, password: passwordCrypt },
        { transaction: t },
      );

      await usuario.addPerfils(perfiles, { transaction: t });
      await usuario.addRols(roles, { transaction: t });
      const idUsuario = usuario.id;
      await t.commit();

      const us = await Usuario.getById(idUsuario);
      const { Perfils, Rols } = us.dataValues;

      return res.status(HttpCode.HTTP_CREATED).json({
        id: usuario.id,
        email: usuario.email,
        perfiles: Perfils,
        roles: Rols,
      });
    } catch (e) {
      await t.rollback();
      throw e;
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
        returning: ['id', 'email'],
      },
    );

    return res.status(HttpCode.HTTP_OK).json(usuario[1]);
  }

  static async updateRecoveryPassword(req, res) {
    const { password, confirmPassword, token } = req.body;

    const salt = bcrypt.genSaltSync();
    const passwordCrypt = bcrypt.hashSync(password, salt);

    if (password !== confirmPassword) { throw new NotFoundException('NOT_FOUND', 400, 'Error! Contraseña incorrecta'); }

    const decoded = jwt.decode(token, process.env.SECRET_KEY);

    const usuario = await Usuario.update(
      {
        password: passwordCrypt,
      },
      {
        where: {
          id: decoded.id,
        },
      },
    );

    await Usuario.update({ token_valid_after: moment().tz('America/El_Salvador').format() }, { where: { id: decoded.id } });

    return res.status(HttpCode.HTTP_CREATED).json({
      message: 'contraseña actualizada',
    });
  }

  static async destroy(req, res) {
    const { id } = req.params;

    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    await Usuario.update(
      {
        active: false,
      },
      {
        where: {
          id,
        },
      },
    );

    return res.status(HttpCode.HTTP_OK).json({
      message: 'Usuario Eliminado',
    });
  }

  static async show(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const user = await Usuario.getById(id);

    if (!user) {
      throw new NotFoundException();
    }
    const { Perfils: perfiles, Rols: roles, ...usuario } = user.dataValues;
    res.status(HttpCode.HTTP_OK).json({ ...usuario, perfiles, roles });
  }

  static async sendEmail(req, res) {
    const usuario = await Usuario.findOne(
      {
        where: {
          email: req.params.email,
          is_suspended: false,
        },
        returning: ['id', 'email'],
      },
    );
    if (usuario === null) { throw new NotFoundException(); }

    const token = await Auth.createToken({
      id: usuario.id,
      email: usuario.email,
    });

    // eslint-disable-next-line no-unused-vars
    const refreshToken = await Auth.refresh_token(usuario);

    await usuario.update({ token_valid_after: moment().tz('America/El_Salvador').format() }, { where: { id: usuario.id } });

    const uri = `${process.env.URL}/api/recovery_password/${token}`;

    if (!Mailer.sendMail(usuario.email, `Ingrese al siguiente enlace: ${uri}`, 'Restablecer Contraseña', '¿Olvidaste tu contraseña?')) {
      console.log('No se envio');
    }

    return res.status(HttpCode.HTTP_OK).json({ message: 'El correo ha sido enviado' });
  }

  static async addUserProfile(req, res) {
    const { id_usuario: idUsuario } = req.params;
    if (Number.isNaN(idUsuario)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');

    const { perfiles } = req.body;

    if (perfiles.length === 0) {
      throw new BadRequestException(
        'BAD_REQUEST',
        400,
        'No se envío ningún perfil',
      );
    }
    const user = await Usuario.findOne({ where: { id: idUsuario } });
    const userProfils = await user.addPerfils(perfiles);

    return res.status(HttpCode.HTTP_CREATED).json({
      user,
      userProfils,
    });
  }

  static async addUserRole(req, res) {
    const { id_usuario: idUsuario } = req.params;
    const { roles } = req.body;

    if (Number.isNaN(idUsuario)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');

    if (roles.length === 0) {
      throw new BadRequestException(
        'BAD_REQUEST',
        400,
        'No se envío ningún rol',
      );
    }
    const user = await Usuario.findOne({ where: { id: idUsuario } });
    const userRols = await user.addRols(roles);

    return res.status(HttpCode.HTTP_CREATED).json({
      user_rols: userRols,
    });
  }

  static async destroyUserPerfil(req, res) {
    const { id_usuario: idUsuario } = req.params;
    const { perfiles } = req.body;

    if (Number.isNaN(idUsuario)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');

    if (perfiles.length && perfiles.length <= 0) {
      throw new BadRequestException(
        'BAD_REQUEST',
        400,
        'No se envío ningún perfil',
      );
    }
    await UsuarioPerfil.destroy({
      where: {
        id_usuario: idUsuario,
        id_perfil: {
          [Sequelize.Op.in]: perfiles,
        },
      },
    });
    return res
      .status(HttpCode.HTTP_OK)
      .json({ message: 'Perfiles eliminados' });
  }

  static async destroyUserRol(req, res) {
    const { id_usuario: idUsuario } = req.params;
    const { roles } = req.body;

    if (Number.isNaN(idUsuario)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');

    if (roles.length && roles.length <= 0) {
      throw new BadRequestException(
        'BAD_REQUEST',
        400,
        'No se envío ningún rol',
      );
    }
    await UsuarioRol.destroy({
      where: {
        id_usuario: idUsuario,
        id_rol: {
          [Sequelize.Op.in]: roles,
        },
      },
    });
    return res.status(HttpCode.HTTP_OK).json({ message: 'roles eliminados' });
  }
}
