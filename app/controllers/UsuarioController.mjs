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
import VerifyModel from '../utils/VerifyModel.mjs';
import {
  Usuario, UsuarioRol, UsuarioPerfil, Perfil, Rol,
} from '../models/index.mjs';
import MetodoAutenticacionUsuario from '../models/MetodoAutenticacionUsuario.mjs';
import Auth from '../utils/Auth.mjs';
import Security from '../services/security.mjs';
import MetodoAutenticacion from '../models/MetodoAutenticacion.mjs';
import getRols from '../services/getRols.mjs';
import ForbiddenException from '../../handlers/ForbiddenException.mjs';

export default class UsuarioController {
  static async index(req, res) {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.per_page) || 10;
    const { rows: usuarios, count: totalRows } = await Usuario.findAndCountAll({
      distinct: true,
      limit: perPage,
      offset: (page - 1) * perPage,
      attributes: { exclude: ['password', 'token_valid_after', 'two_factor_status'] },
      include: [Rol, Perfil],
      order: ['id'],
    });
    return res.status(HttpCode.HTTP_OK).json({
      page,
      per_page: perPage,
      total_rows: totalRows,
      body: usuarios,
    });
  }

  static async store(req, res) {
    const connection = DB.connection();
    const t = await connection.transaction();
    const {
      perfiles, roles, email, password,
    } = req.body;
    const isSuspended = process.env.DISABLE_TWO_FACTOR_AUTH === 'false';
    const salt = bcrypt.genSaltSync();
    const passwordCrypt = bcrypt.hashSync(password, salt);

    const emailExist = await Usuario.findOne({
      where: {
        email,
      },
    });

    if (emailExist) throw new UnprocessableEntityException('Correo electronico ya existe');

    try {
      if (perfiles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < perfiles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          await VerifyModel.exist(Perfil, perfiles[index], `No se ha encontrado el perfil con id ${perfiles[index]}`);
        }
      }
      if (roles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < roles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          await VerifyModel.exist(Rol, roles[index], `No se ha encontrado el rol con id ${roles[index]}`);
        }
      }
      const usuario = await Usuario.create(
        { email, password: passwordCrypt, is_suspended: isSuspended },
        { transaction: t },
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
        { transaction: t },
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
        htmlForEmail,
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
    const {
      email, roles, perfiles,
    } = req.body;
    const dataToUpdate = {};

    if (email !== null && email !== '') {
      dataToUpdate.email = email;
    }

    const usuario = await VerifyModel.exist(Usuario, req.params.id, `No se ha encontrado el usuario con id ${req.params.id}`);

    usuario.update(dataToUpdate, {
      where: {
        id: req.params.id,
      },
      returning: ['id', 'email', 'is_suspended'],
    });

    await usuario.setRols(roles);
    await usuario.setPerfils(perfiles);
    return res.status(HttpCode.HTTP_OK).json(usuario);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    const usuario = await VerifyModel.exist(Usuario, id, `No se ha encontrado el usuario con id ${id}`);

    await usuario.update(
      {
        is_suspended: !usuario.is_suspended,
      },
    );

    return res.status(HttpCode.HTTP_OK).json({
      message: usuario.is_suspended ? 'Usuario deshabilitado' : 'Usuario habilitado',
    });
  }

  static async show(req, res) {
    const { id } = req.params;

    const user = await VerifyModel.exist(
      Usuario,
      id,
      `No se ha encontrado el usuario con id ${id}`,
      {
        include: [
          { model: Perfil, through: { attributes: [] } },
          { model: Rol, through: { attributes: [] } },
        ],
      },
    );

    // const { Perfils: perfiles, Rols: roles, ...usuario } = user.dataValues;
    res.status(HttpCode.HTTP_OK).json(user);
  }

  static async updatePassword(req, res) {
    const {
      password_actual: passwordActual,
      password,
      confirm_password: confirmPassword,
    } = req.body;
    if (!bcrypt.compareSync(passwordActual, req.usuario.password)) {
      throw new ForbiddenException(
        'La contraseña proporcionada no es correcta',
      );
    }
    if (passwordActual === password) {
      throw new NotFoundException(
        'La nueva contraseña no puede ser igual que la anterior',
      );
    }
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Las contraseñas no coinciden',
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
      },
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
      throw new UnprocessableEntityException(
        'El correo no puede ser igual al anterior',
      );
    }

    /** Confirmacion de password para el cambio de contraseña */
    if (!bcrypt.compareSync(password, req.usuario.password)) {
      throw new BadRequestException(
        'La contraseña proporcionada no es correcta',
      );
    }

    /** Validacion que el correo no se encuentre en uso en la BD */
    const usuario = await Usuario.findOne({ where: { email } });
    if (usuario) {
      throw new NotFoundException(
        'El correo ya se encuentra en uso',
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
      },
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
    const { id_metodo: idMetodo } = req.body;

    const existMethod = await MetodoAutenticacionUsuario.findOne({
      where: {
        id_usuario: req.usuario.id,
        id_metodo: idMetodo,
      },
    });
    const newToken = await Security.generateTwoFactorAuthCode(req.usuario.email);
    if (!existMethod) {
      await MetodoAutenticacionUsuario.create({
        id_metodo: idMetodo,
        id_usuario: req.usuario.id,
        is_primary: false,
        temporal_key: newToken.secret_code,
      });
      if (Number(idMetodo) === 2) {
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
        'Su codigo de verificacion es:',
      );
      return res.status(HttpCode.HTTP_OK).send({
        message: 'Favor valide el nuevo metodo de autenticacion, revise su correo electronico',
      });
    }
    await existMethod.update({ temporal_key: newToken.secret_code });
    if (Number(idMetodo) === 2) {
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
    const { id_metodo: idMetodo, codigo } = req.body;
    let timeToCodeValid = null;
    if (Number(idMetodo) === 1) timeToCodeValid = process.env.GOOGLE_AUTH_TIME_EMAIL;
    const methodUser = await MetodoAutenticacionUsuario.findOne({
      where: {
        id_usuario: req.usuario.id,
        id_metodo: idMetodo,
      },
    });
    if (!methodUser) {
      throw new NotFoundException(
        'El usuario no tiene este metodo de autenticacion asociado',
      );
    }
    const isValidCode = await Security.verifyTwoFactorAuthCode(
      codigo,
      methodUser.temporal_key,
      timeToCodeValid,
    );
    if (isValidCode) {
      await methodUser.update({ secret_key: methodUser.temporal_key, temporal_key: null });
      await Mailer.sendMail(
        req.usuario.email,
        'Se ha cambiado el metodo de autenticacion',
        'Metodo de autenticacion cambiado',
        'ALERTA!',
      );
      return res
        .status(HttpCode.HTTP_OK)
        .send({ message: 'Se ha modificado el metodo de autenticacion con exito!' });
    }
    throw new UnprocessableEntityException(
      'El codigo proporcionado no es valido',
    );
  }

  static async updatePrimaryMethod(req, res) {
    await MetodoAutenticacionUsuario.update(
      { is_primary: true },
      { where: { id: req.body.id_metodo_usuario } },
    );
    await MetodoAutenticacionUsuario.update(
      { is_primary: false },
      { where: { id_usuario: req.usuario.id, [Op.not]: [{ id: req.body.id_metodo_usuario }] } },
    );
    await Mailer.sendMail(
      req.usuario.email,
      'Se ha cambio el metodo de autenticacion primario',
      'Alerta de actualizacion de cuenta',
      'Alerta',
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
    const metodosAutenticacion = metodos.map((metodo) => {
      const isPrimary = usuario.MetodoAutenticacions.filter(
        (metodoUsuario) => metodoUsuario.id === metodo.id,
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
