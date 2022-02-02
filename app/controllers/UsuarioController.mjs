/* eslint-disable no-unused-vars */
import bcrypt from 'bcryptjs';
import Sequelize, { json, Op } from 'sequelize';
import moment from 'moment-timezone';
import speakeasy, { totp, hotp, generateSecret } from 'speakeasy';
import { toDataURL } from 'qrcode';
import HttpCode from '../../configs/httpCode.mjs';
import DB from '../nucleo/DB.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import Mailer from '../services/mailer.mjs';

import { Usuario, UsuarioRol, UsuarioPerfil, Perfil, Rol } from '../models/index.mjs';
import MetodoAutenticacionUsuario from '../models/MetodoAutenticacionUsuario.mjs';
import Auth from '../utils/Auth.mjs';
import Security from '../services/security.mjs';
import MetodoAutenticacion from '../models/MetodoAutenticacion.mjs';
import getRols from '../services/getRols.mjs';
import ForbiddenException from '../../handlers/ForbiddenException.mjs';

export default class UsuarioController {
  static async index(req, res) {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password', 'token_valid_after', 'two_factor_status'] },
      include: [Rol, Perfil],
    });
    return res.status(HttpCode.HTTP_OK).json(usuarios);
  }

  static async store(req, res) {
    if (!(await Security.isGranted(req, 'SUPER-ADMIN'))) {
      throw new ForbiddenException('FORBIDDEN', 403, 'ERROR NO SE HA AUTENTICADO');
    }
    const connection = DB.connection();
    const t = await connection.transaction();
    const { perfiles, roles, email, password } = req.body;
    const salt = bcrypt.genSaltSync();
    const passwordCrypt = bcrypt.hashSync(password, salt);

    try {
      if (perfiles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < perfiles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          const perfil = await Perfil.findOne({ where: { id: perfiles[index] } });
          if (!perfil) {
            throw new NotFoundException(
              'NOT_FOUND',
              404,
              `No se encontró el perfil con id ${perfiles[index]}`
            );
          }
        }
      }
      if (roles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < roles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          const rol = await Rol.findOne({ where: { id: roles[index] } });
          if (!rol) {
            throw new NotFoundException(
              'NOT_FOUND',
              404,
              `No se encontró el rol con id ${roles[index]}`
            );
          }
        }
      }

      const usuario = await Usuario.create(
        { email, password: passwordCrypt, is_suspended: true },
        { transaction: t }
      );

      await usuario.addPerfils(perfiles, { transaction: t });
      await usuario.addRols(roles, { transaction: t });
      const idUsuario = usuario.id;
      const newToken = await Security.generateTwoFactorAuthCode(usuario.email);
      await MetodoAutenticacionUsuario.create(
        {
          id_usuario: usuario.id,
          id_metodo: 1,
          is_primary: true,
          secret_key: newToken.secret_code,
          temporal_key: null,
        },
        { transaction: t }
      );
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
      await Mailer.sendMail(
        usuario.email,
        null,
        'Verificacion de correo electronico',
        null,
        htmlForEmail
      );
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
    // eslint-disable-next-line camelcase
    const { email, password, is_suspended } = req.body;
    const dataToUpdate = {};
    if (req.body.password !== null && req.body.password !== '') {
      dataToUpdate.password = req.body.password;
    }

    if (req.body.is_suspended !== null && req.body.is_suspended !== '') {
      dataToUpdate.is_suspended = req.body.is_suspended;
    }

    if (req.body.email !== null && req.body.email !== '') {
      dataToUpdate.email = req.body.email;
    }

    const usuario = await Usuario.update(dataToUpdate, {
      where: {
        id: req.params.id,
      },
      returning: ['id', 'email', 'is_suspended'],
    });
    return res.status(HttpCode.HTTP_OK).json(usuario[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parámetro no es un id válido'
      );
    }

    await Usuario.update(
      {
        is_suspended: true,
      },
      {
        where: {
          id,
        },
      }
    );

    return res.status(HttpCode.HTTP_OK).json({
      message: 'Usuario Eliminado',
    });
  }

  static async show(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parámetro no es un id válido'
      );
    }

    const user = await Usuario.getById(id);

    if (!user) {
      throw new NotFoundException();
    }
    const { Perfils: perfiles, Rols: roles, ...usuario } = user.dataValues;
    res.status(HttpCode.HTTP_OK).json({ ...usuario, perfiles, roles });
  }

  static async addUserProfile(req, res) {
    const { id_usuario: idUsuario } = req.params;
    if (Number.isNaN(idUsuario)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parametro no es un id válido'
      );
    }

    const { perfiles } = req.body;

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

    if (Number.isNaN(idUsuario)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parametro no es un id válido'
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

    if (Number.isNaN(idUsuario)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parametro no es un id válido'
      );
    }

    await UsuarioPerfil.destroy({
      where: {
        id_usuario: idUsuario,
      },
    });
    return res.status(HttpCode.HTTP_OK).json({ message: 'Perfiles eliminados' });
  }

  static async destroyUserRol(req, res) {
    const { id_usuario: idUsuario } = req.params;

    if (Number.isNaN(idUsuario)) {
      throw new UnprocessableEntityException(
        'UNPROCESSABLE_ENTITY',
        422,
        'El parametro no es un id válido'
      );
    }

    await UsuarioRol.destroy({
      where: {
        id_usuario: idUsuario,
      },
    });
    return res.status(HttpCode.HTTP_OK).json({ message: 'roles eliminados' });
  }

  static async updatePassword(req, res) {
    const {
      password_actual: passwordActual,
      password,
      confirm_password: confirmPassword,
    } = req.body;
    if (!bcrypt.compareSync(passwordActual, req.usuario.password)) {
      throw new ForbiddenException(
        'FORBIDDEN',
        HttpCode.HTTP_FORBIDDEN,
        'La contraseña proporcionada no es correcta'
      );
    }
    if (passwordActual === password) {
      throw new NotFoundException(
        'HTTP_NOT_MODIFIED',
        HttpCode.HTTP_NOT_MODIFIED,
        'La nueva contraseña no puede ser igual que la anterior'
      );
    }
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'BAD_REQUEST',
        HttpCode.HTTP_BAD_REQUEST,
        'Las contraseñas no coinciden'
      );
    }

    const salt = bcrypt.genSaltSync();
    const passwordCrypt = bcrypt.hashSync(password, salt);

    await Usuario.update(
      {
        password: passwordCrypt,
        token_valid_after: moment().subtract(5, 's').tz('America/El_Salvador').format(),
      },
      {
        where: {
          id: req.usuario.id,
        },
      }
    );
    const msg = `
      <p><span>Estimado/a usuario</span></p>
      <p><span>Se le informa que acaba de cambiar la contraseña de su cuenta de manera exitosa</span></p>
      <p><span>En caso de no haber realizado el cambio de contraseña, por favor contacte inmediatamente al administrador</span></p>
    `;

    await Mailer.sendMail(req.usuario.email, msg, 'Cambio de contraseña', 'Contraseña modificada');

    const refreshToken = await Auth.refresh_token(req.usuario);
    const roles = await getRols.roles(req.usuario.id);
    const token = await Auth.createToken({
      id: req.usuario.id,
      roles,
      email: req.usuario.email,
      user: req.usuario,
    });
    return res
      .status(HttpCode.HTTP_OK)
      .json({ message: 'Contraseña actualizada con exito', token, refreshToken });
  }

  static async updateEmail(req, res) {
    const { email, password } = req.body;
    /** Validacion que el correo ingresado no sea igual al correo actual */
    if (email === req.usuario.email) {
      throw new NotFoundException(
        'HTTP_NOT_MODIFIED',
        HttpCode.HTTP_NOT_MODIFIED,
        'El correo no puede ser igual al anterior'
      );
    }

    /** Confirmacion de password para el cambio de contraseña */
    if (!bcrypt.compareSync(password, req.usuario.password)) {
      throw new BadRequestException(
        'BAD_REQUEST',
        HttpCode.HTTP_BAD_REQUEST,
        'La contraseña proporcionada no es correcta'
      );
    }

    /** Validacion que el correo no se encuentre en uso en la BD */
    const usuario = await Usuario.findOne({ where: { email } });
    if (usuario) {
      throw new NotFoundException(
        'BAD_REQUEST',
        HttpCode.HTTP_BAD_REQUEST,
        'El correo ya se encuentra en uso'
      );
    }

    /** Envio de notificacion por correo electronico  */
    const message = `
                <mjml>
                <mj-body>
                  <mj-section>
                    <mj-column>
                      <mj-image src="https://next.salud.gob.sv/index.php/s/AHEMQ38JR93fnXQ/download" width="350px"></mj-image>
                          <mj-button width="80%" padding="5px 10px" font-size="20px" background-color="#175efb" border-radius="99px">
                            <mj-text  align="center" font-weight="bold"  color="#ffffff" >
                              Confirmacion de cambio de correo electronico
                            </mj-text>
                        </mj-button>
                      <mj-spacer css-class="primary"></mj-spacer>
                      <mj-divider border-width="3px" border-color="#175efb" />
                      <mj-text  align="center" font-size="16px">
                        <p>Estimado usuario se le comunica que el correo: <span style="font-weight:bold;">${req.usuario.email} </span>
                        ha sido cambiado satisfactoriamente. </p>
                        <p>Desde este momento <span style="font-weight:bold;">${email}</span> manejará la cuenta en donde solicito el cambio</p>
                      </mj-text>
                    </mj-column>
                  </mj-section>
                </mj-body>
              </mjml>`;
    await Mailer.sendMail(email, null, 'Cambio de email', null, message);
    await Usuario.update(
      {
        email,
        token_valid_after: moment().subtract(5, 's').tz('America/El_Salvador').format(),
      },
      {
        where: {
          id: req.usuario.id,
        },
      }
    );
    const refreshToken = await Auth.refresh_token(req.usuario);
    const roles = await getRols.roles(req.usuario.id);
    const token = await Auth.createToken({
      id: req.usuario.id,
      roles,
      email: req.usuario.email,
      user: req.usuario,
    });
    return res
      .status(HttpCode.HTTP_OK)
      .json({ message: 'Correo electronico actualizado con exito', token, refreshToken });
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
        return res.status(HttpCode.HTTP_OK).send({
          message: 'Favor valide el nuevo metodo de autenticacion, escanee el codigo qr',
          codigoQr: await toDataURL(newToken.qrCode),
        });
      }
      const verificationCode = speakeasy.totp({
        secret: newToken.secret_code,
        encoding: 'base32',
        time: process.env.GOOGLE_AUTH_TIME_EMAIL,
      });
      await Mailer.sendMail(
        req.usuario.email,
        verificationCode,
        'Codigo de verificacion',
        'Su codigo de verificacion es:'
      );
      return res.status(HttpCode.HTTP_OK).send({
        message: 'Favor valide el nuevo metodo de autenticacion, revise su correo electronico',
      });
    }
    await existMethod.update({ temporal_key: newToken.secret_code });
    // eslint-disable-next-line camelcase,max-len
    if (Number(id_metodo) === 2) {
      return res.status(HttpCode.HTTP_OK).send({
        message: 'Favor valide el nuevo metodo de autenticacion, escanee el codigo qr',
        codigoQr: await toDataURL(newToken.qrCode),
      });
    }
    return res.status(HttpCode.HTTP_OK).send({
      message: 'Favor valide el nuevo metodo de autenticacion, revise su correo electronico',
    });
  }

  static async verifyNewMethodUser(req, res) {
    // eslint-disable-next-line camelcase
    const { id_metodo, codigo } = req.body;
    let timeToCodeValid = null;
    // eslint-disable-next-line camelcase,no-unused-expressions
    if (Number(id_metodo) === 1) timeToCodeValid = process.env.GOOGLE_AUTH_TIME_EMAIL;
    const methodUser = await MetodoAutenticacionUsuario.findOne({
      where: {
        id_usuario: req.usuario.id,
        // eslint-disable-next-line camelcase
        id_metodo,
      },
    });
    if (!methodUser) {
      throw new NotFoundException(
        'NOT_FOUND',
        HttpCode.HTTP_BAD_REQUEST,
        'El usuario no tiene este metodo de autenticacion asociado'
      );
    }
    const isValidCode = await Security.verifyTwoFactorAuthCode(
      codigo,
      methodUser.temporal_key,
      timeToCodeValid
    );
    if (isValidCode) {
      await methodUser.update({ secret_key: methodUser.temporal_key, temporal_key: null });
      await Mailer.sendMail(
        req.usuario.email,
        'Se ha cambiado el metodo de autenticacion',
        'Metodo de autenticacion cambiado',
        'ALERTA!'
      );
      return res
        .status(HttpCode.HTTP_OK)
        .send({ message: 'Se ha modificado el metodo de autenticacion con exito!' });
    }
    throw new UnprocessableEntityException(
      'UNPROCESSABLE_ENTITY',
      422,
      'El codigo proporcionado no es valido'
    );
  }

  static async updatePrimaryMethod(req, res) {
    await MetodoAutenticacionUsuario.update(
      { is_primary: true },
      { where: { id: req.body.id_metodo_usuario } }
    );
    await MetodoAutenticacionUsuario.update(
      { is_primary: false },
      { where: { id_usuario: req.usuario.id, [Op.not]: [{ id: req.body.id_metodo_usuario }] } }
    );
    await Mailer.sendMail(
      req.usuario.email,
      'Se ha cambio el metodo de autenticacion primario',
      'Alerta de actualizacion de cuenta',
      'Alerta'
    );
    return res.status(HttpCode.HTTP_OK).send({ message: 'Solicitud procesada con exito!' });
  }

  static async getMetodosUsuario(req, res) {
    const metodos = await MetodoAutenticacion.findAll();
    const usuario = await Usuario.findOne({
      where: {
        id: req.usuario.id,
      },
      attributes: ['id'],
      // eslint-disable-next-line max-len
      include: [
        {
          // eslint-disable-next-line max-len
          model: MetodoAutenticacion,
          attributes: ['id', 'nombre', 'icono'],
          through: { attributes: ['is_primary', 'id'] },
        },
      ],
    });
    // eslint-disable-next-line array-callback-return
    const metodosAutenticacion = metodos.map((metodo) => {
      // eslint-disable-next-line no-mixed-operators
      const isPrimary = usuario.MetodoAutenticacions.filter(
        (metodoUsuario) => metodoUsuario.id === metodo.id
      );
      return {
        nombre: metodo.nombre,
        descripcion: metodo.descripcion,
        icono: metodo.icono,
        id: metodo.id,
        is_primary:
          isPrimary.length > 0 ? isPrimary[0].MetodoAutenticacionUsuario.is_primary : null,
        id_metodo_usuario: isPrimary.length > 0 ? isPrimary[0].MetodoAutenticacionUsuario.id : null,
      };
    });
    return res.status(HttpCode.HTTP_OK).send({
      metodos_autenticacion: metodosAutenticacion,
    });
  }
}
