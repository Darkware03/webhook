/* eslint-disable no-unused-vars */
import bcrypt from 'bcryptjs';
import Sequelize from 'sequelize';
import moment from 'moment-timezone';
import speakeasy, { totp, hotp, generateSecret } from 'speakeasy';
import { toDataURL } from 'qrcode';
import HttpCode from '../../configs/httpCode.mjs';
import DB from '../nucleo/DB.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import Mailer from '../services/mailer.mjs';

import {
  Usuario,
  UsuarioRol,
  UsuarioPerfil,
  Perfil,
  Rol,
} from '../models/index.mjs';
import MetodoAutenticacionUsuario from '../models/MetodoAutenticacionUsuario.mjs';
import Auth from '../utils/Auth.mjs';
import Security from '../services/security.mjs';

export default class UsuarioController {
  static async index(req, res) {
    const usuarios = await Usuario.findAll({});
    return res.status(HttpCode.HTTP_OK).json(usuarios);
  }

  static async store(req, res) {
    if (!await Security.isGranted(req, 'SUPER-ADMIN')) {
      throw new NotFoundException('NOT_FOUND', 404, 'ERROR NO SE HA AUTENTICADO');
    }
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
        { email, password: passwordCrypt, is_suspended: true },
        { transaction: t },
      );

      await usuario.addPerfils(perfiles, { transaction: t });
      await usuario.addRols(roles, { transaction: t });
      const idUsuario = usuario.id;
      const newToken = Security.generateTwoFactorAuthCode(usuario.email);

      await MetodoAutenticacionUsuario.create({
        id_usuario: usuario.id,
        id_metodo: 1,
        is_primary: true,
        secret_key: newToken.secret_code,
        temporal_key: null,
      }, { transaction: t });
      await t.commit();

      const us = await Usuario.getById(idUsuario);
      const { Perfils, Rols } = us.dataValues;
      const token = await Auth.createToken({ idUsuario });
      // eslint-disable-next-line max-len
      const htmlForEmail = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-image src="https://next.salud.gob.sv/index.php/s/AHEMQ38JR93fnXQ/download" width="350px"></mj-image>
            <mj-button width="80%" padding="5px 10px" font-size="20px" background-color="#175efb" border-radius="99px">
               <mj-text  align="center" font-weight="bold"  color="#ffffff" >
                 Hola ${usuario.email}
              </mj-text>
           </mj-button>
        <mj-spacer css-class="primary"></mj-spacer>
        <mj-divider border-width="3px" border-color="#175efb" />
        <mj-text  align="center" font-weight="bold" font-size="12px">
         Para verificar tu cuenta debes de hacer click en el siguiente enlace:
        </mj-text>
        <mj-button background-color="#175efb" href="${process.env.FRONT_URL}/verificar/${token}">
          VERIFICAR MI CUENTA
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
      // eslint-disable-next-line max-len
      await Mailer.sendMail(usuario.email, null, 'Verificacion de correo electronico', null, htmlForEmail);
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

  static async updatePassword(req, res) {
    // eslint-disable-next-line camelcase
    const { password_actual, password, confirm_password } = req.body;
    if (!bcrypt.compareSync(password_actual, req.usuario.password)) { throw new NotFoundException('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, 'La contraseña proporcionada no es correcta'); }
    // eslint-disable-next-line camelcase
    if (password_actual === password) { throw new NotFoundException('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, 'La nueva contraseña no puede ser igual que la anterior'); }
    // eslint-disable-next-line camelcase
    if (password !== confirm_password) { throw new NotFoundException('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, 'Las contraseñas no coinciden'); }

    const salt = bcrypt.genSaltSync();
    const passwordCrypt = bcrypt.hashSync(password, salt);

    await Usuario.update({
      password: passwordCrypt,
      token_valid_after: moment().tz('America/El_Salvador').format(),
    }, {
      where: {
        id: req.usuario.id,
      },
      returning: ['id', 'email'],
    });
    const msg = 'Se le comunica que su contraseña ha sido modificada exitosamente';

    await Mailer.sendMail(req.usuario.email, msg, 'Cambio de contraseña', 'Contraseña modificada');
    return res.status(HttpCode.HTTP_OK).json({ message: 'Contraseña actualizada con exito' });
  }

  static async updateEmail(req, res) {
    const { email, password } = req.body;
    /** Validacion que el correo ingresado no sea igual al correo actual */
    if (email === req.usuario.email) { throw new NotFoundException('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, 'El correo no puede ser igual al anterior'); }

    /** Confirmacion de password para el cambio de contraseña */
    if (!bcrypt.compareSync(password, req.usuario.password)) { throw new NotFoundException('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, 'La contraseña proporcionada no es correcta'); }

    /** Validacion que el correo no se encuentre en uso en la BD */
    const usuario = await Usuario.findAll({ where: { email } });
    if (usuario.length) { throw new NotFoundException('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, 'El correo ya se encuentra en uso'); }

    await Usuario.update(
      {
        email,
        token_valid_after: moment().tz('America/El_Salvador').format(),
      },
      {
        where: {
          id: req.usuario.id,
        },
      },
    );

    /** Envio de notificacion por correo electronico  */
    const menssage = `
          <mj-text >
            Estimado usuario se le comunica que el correo: <mj-text font-style="oblique"> ${req.usuario.email} </mj-text>
          </mj-text>
          <mj-text>
            ha sido cambiado satisfactoriamente. 
          </mj-text> 
          <mj-text>
            Desde este momento ${email} manejará la cuenta en donde solicito el cambio
          </mj-text>
        `;
    await Mailer.sendMail(email, menssage, 'Cambio de email', 'Confirmacion de cambio de correo electronico');
    return res.status(HttpCode.HTTP_OK).json({ message: 'Correo electronico actualizado con exito' });
  }

  static async storeMethodUser(req, res) {
    // eslint-disable-next-line camelcase
    const { id_metodo } = req.body;
    // eslint-disable-next-line camelcase
    const existMethod = await MetodoAutenticacionUsuario.findOne({
      where: {
        id_usuario: req.usuario.id,
        // eslint-disable-next-line camelcase
        id_metodo,
      },
    });
    const newToken = await Security.generateTwoFactorAuthCode(req.usuario.email);
    if (!existMethod) {
      await MetodoAutenticacionUsuario.create({
        // eslint-disable-next-line camelcase
        id_metodo,
        id_usuario: req.usuario.id,
        is_primary: false,
        temporal_key: newToken.secret_code,
      });
      // eslint-disable-next-line camelcase
      if (Number(id_metodo) === 2) {
        return res.status(HttpCode.HTTP_OK).send({ message: 'Favor valide el nuevo metodo de autenticacion, escanee el codigo qr', codigoQr: await toDataURL(newToken.qrCode) });
      }
      const verificationCode = speakeasy.totp({
        secret: newToken.secret_code,
        encoding: 'base32',
        time: process.env.GOOGLE_AUTH_TIME_EMAIL,
      });
      await Mailer.sendMail(req.usuario.email, verificationCode, 'Codigo de verificacion', 'Su codigo de verificacion es:');
      return res.status(HttpCode.HTTP_OK).send({ message: 'Favor valide el nuevo metodo de autenticacion, revise su correo electronico' });
    }
    await existMethod.update({ temporal_key: newToken.secret_code });
    // eslint-disable-next-line camelcase,max-len
    if (Number(id_metodo) === 2) return res.status(HttpCode.HTTP_OK).send({ message: 'Favor valide el nuevo metodo de autenticacion, escanee el codigo qr', codigoQr: await toDataURL(newToken.qrCode) });
    return res.status(HttpCode.HTTP_OK).send({ message: 'Favor valide el nuevo metodo de autenticacion, revise su correo electronico' });
  }

  static async verifyNewMethodUser(req, res) {
    // eslint-disable-next-line camelcase
    const { id_metodo, codigo } = req.body;
    let timeToCodeValid = null;
    // eslint-disable-next-line camelcase,no-unused-expressions
    if (Number(id_metodo) === 1)timeToCodeValid = process.env.GOOGLE_AUTH_TIME_EMAIL;
    const methodUser = await MetodoAutenticacionUsuario.findOne({
      where: {
        id_usuario: req.usuario.id,
        // eslint-disable-next-line camelcase
        id_metodo,
      },
    });
    if (!methodUser) throw new NotFoundException('NOT_FOUND', HttpCode.HTTP_BAD_REQUEST, 'El usuario no tiene este metodo de autenticacion asociado');
    const isValidCode = await Security.verifyTwoFactorAuthCode(codigo, methodUser.temporal_key, timeToCodeValid);
    if (isValidCode) {
      await methodUser.update({ secret_key: methodUser.temporal_key, temporal_key: null });
      await Mailer.sendMail(req.usuario.email, 'Se ha cambiado el metodo de autenticacion', 'Metodo de autenticacion cambiado', 'ALERTA!');
      return res.status(HttpCode.HTTP_OK).send({ message: 'Se ha modificado el metodo de autenticacion con exito!' });
    }
    throw new NotFoundException('NOT_FOUND', HttpCode.HTTP_BAD_REQUEST, 'El codigo proporcionado no es valido');
  }
}
