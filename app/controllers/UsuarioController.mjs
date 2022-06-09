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
    const {
      page = 1, per_page: perPage = 10, paginacion = 'true', email, habilitado,
    } = req.query;

    const filters = {};
    const options = {};

    if (paginacion === 'true') {
      await VerifyModel.isValid(perPage, 'cantidad por pagina debe ser de tipo entero');
      await VerifyModel.isValid(page, 'pagina debe ser de tipo entero');

      options.offset = perPage * (page - 1);
      options.limit = Number(perPage);
      options.distinct = true;
    }

    if (email) {
      filters.email = {
        [Op.iLike]: `%${email || ''}%`,
      };
    }
    if (habilitado) {
      filters.is_suspended = !(habilitado === 'true');
    }

    const { rows: usuarios, count: totalRows } = await Usuario.findAndCountAll({
      ...options,
      attributes: { exclude: ['password', 'token_valid_after', 'two_factor_status'] },
      include: [Rol, Perfil],
      order: ['id'],
      where: filters,
    });

    if (paginacion === 'true') {
      res.set({
        total_rows: Number(totalRows),
        page: Number(page),
        per_page: Number(perPage),
      });
    }

    return res.status(HttpCode.HTTP_OK).json(usuarios);
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

    let userRoles;
    let userProfiles;
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
          await VerifyModel.exist(
            Perfil,
            perfiles[index],
            `No se ha encontrado el perfil con id ${perfiles[index]}`,
          );
        }
        userProfiles = await Perfil.findAll({
          where: {
            id: perfiles,
          },
        });
      }
      if (roles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < roles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          await VerifyModel.exist(
            Rol,
            roles[index],
            `No se ha encontrado el rol con id ${roles[index]}`,
          );
        }
        userRoles = await Rol.findAll({
          where: {
            id: roles,
          },
        });
      }
      const usuario = await Usuario.create(
        {
          email,
          password: passwordCrypt,
          is_suspended: isSuspended,
          two_factor_status: process.env.TWO_FACTOR_AUTH === 'true',
        },
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
          two_factor_status: process.env.TWO_FACTOR_AUTH === 'true',
          id_auth_method_status: 1,
        },
        { transaction: t },
      );

      const token = await Auth.createToken({ idUsuario }, process.env.SECRET_KEY);

      const header = [
        {
          tagName: 'mj-button',
          attributes: {
            width: '80%',
            padding: '5px 10px',
            'font-size': '20px',
            'background-color': '#175efb',
            'border-radius': '99px',
          },
          content: `Hola ${usuario.email}`,
        },
      ];

      const body = [
        {
          tagName: 'mj-button',
          attributes: {
            width: '80%',
            padding: '5px 10px',
            'font-size': '20px',
            'background-color': '#175efb',
            href: `${process.env.FRONT_URL}/verificar/${token}`,
          },
          content: 'VERIFICAR MI CUENTA',
        },
      ];

      await Mailer.sendMail({
        email: usuario.email,
        header,
        subject: 'Verificacion de correo electronico',
        message: 'Para verificar tu cuenta debes de hacer click en el siguiente enlace:',
        body,
      });

      await t.commit();

      return res.status(HttpCode.HTTP_CREATED).json({
        id: usuario.id,
        email: usuario.email,
        perfiles: userProfiles,
        roles: userRoles,
      });
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  static async update(req, res) {
    const { email, roles = [], perfiles = [] } = req.body;
    const dataToUpdate = {};

    if (email !== null && email !== '') {
      dataToUpdate.email = email;
    }

    const usuario = await VerifyModel.exist(
      Usuario,
      req.params.id,
      `No se ha encontrado el usuario con id ${req.params.id}`,
    );

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
    const usuario = await VerifyModel.exist(
      Usuario,
      id,
      `No se ha encontrado el usuario con id ${id}`,
    );

    await usuario.update({
      is_suspended: !usuario.is_suspended,
    });

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
      throw new ForbiddenException('La contraseña proporcionada no es correcta');
    }
    if (passwordActual === password) {
      throw new NotFoundException('La nueva contraseña no puede ser igual que la anterior');
    }
    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
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
    const token = await Auth.createToken(
      {
        roles,
        user: req.usuario,
      },
      process.env.SECRET_KEY,
    );
    return res
      .status(HttpCode.HTTP_OK)
      .json({ message: 'Contraseña actualizada con exito', token, refreshToken });
  }

  static async updateEmail(req, res) {
    const { email, password } = req.body;
    /** Validacion que el correo ingresado no sea igual al correo actual */
    if (email === req.usuario.email) {
      throw new UnprocessableEntityException('El correo no puede ser igual al anterior');
    }

    /** Confirmacion de password para el cambio de contraseña */
    if (!bcrypt.compareSync(password, req.usuario.password)) {
      throw new BadRequestException('La contraseña proporcionada no es correcta');
    }

    /** Validacion que el correo no se encuentre en uso en la BD */
    const emailExist = await Usuario.findOne({ where: { email } });
    if (emailExist) {
      throw new NotFoundException('El correo ya se encuentra en uso');
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
    const usuario = await Usuario.findOne({
      where: {
        id: req.usuario.id,
      },
      attributes: ['id', 'email', 'last_login', 'two_factor_status'],
    });
    await usuario.update(
      {
        email,
        token_valid_after: moment().tz('America/El_Salvador').format(),
      },
      { returning: true },
    );

    const refreshToken = await Auth.refresh_token(req.usuario);
    const roles = await getRols.roles(req.usuario.id);
    const token = await Auth.createToken(
      {
        roles,
        user: usuario,
      },
      process.env.SECRET_KEY,
    );
    return res
      .status(HttpCode.HTTP_OK)
      .json({ message: 'Correo electronico actualizado con exito', token, refreshToken });
  }

  static async storeMethodUser(req, res) {
    const { id_method: idMetodo } = req.body;

    const token = await Security.generateTwoFactorAuthCode(req.usuario.email);

    const [authMethod, created] = await MetodoAutenticacionUsuario.findOrCreate({
      where: {
        id_usuario: req.usuario.id,
        id_metodo: idMetodo,
      },
      defaults: {
        is_primary: false,
        secret_key: token.secret_code,
        id_auth_method_status: 2,
      },
    });

    if (!created) await authMethod.update({ id_auth_method_status: 2 });

    if (Number(idMetodo) === 2) {
      return res.status(HttpCode.HTTP_OK).send({
        message: 'Favor valide el nuevo metodo de autenticacion, escanee el codigo qr',
        codigoQr: await toDataURL(token.qrCode),
      });
    }

    const code = speakeasy.totp({
      secret: authMethod.secret_key,
      encoding: 'base32',
      window: Number(process.env.TIME_BASED_TOKEN_2FA),
      step: 10,
    });

    const header = [
      {
        tagName: 'mj-button',
        attributes: {
          width: '80%',
          padding: '5px 10px',
          'font-size': '20px',
          'background-color': '#175efb',
          'border-radius': '99px',
        },
        content: 'El codigo de verificacion es:',
      },
    ];

    await Mailer.sendMail({
      email: req.usuario.email,
      header,
      subject: 'Codigo de verificación de usuario',
      message: code,
    });
    return res.status(HttpCode.HTTP_OK).send({
      message: 'Favor valide el nuevo metodo de autenticación, revise su correo electrónico',
    });
  }

  static async authMethodVerification(req, res) {
    const { id_method: idMetodo, code } = req.body;
    const methodUser = await MetodoAutenticacionUsuario.findOne({
      where: {
        id_usuario: req.usuario.id,
        id_metodo: idMetodo,
      },
    });
    if (!methodUser) {
      throw new NotFoundException('El usuario no tiene este metodo de autenticacion asociado');
    }
    const verifyCodeParams = {
      code,
      secretKey: methodUser.secret_key,
    };

    if (Number(idMetodo) === 1) verifyCodeParams.time = process.env.TIME_BASED_TOKEN_2FA;
    const isValidCode = await Security.verifyTwoFactorAuthCode(verifyCodeParams);

    if (!isValidCode) {
      throw new UnprocessableEntityException('El codigo proporcionado no es valido');
    }

    await methodUser.update({ secret_key: methodUser.temporal_key, id_auth_method_status: 1 });
    const header = [
      {
        tagName: 'mj-text',
        attributes: {
          width: '80%',
          padding: '5px 10px',
          'font-size': '20px',
          'background-color': '#175efb',
          'border-radius': '99px',
        },
        content: 'Se ha cambiado el metodo de autenticación',
      },
    ];
    await Mailer.sendMail({
      email: req.usuario.email,
      subject: 'Metodo de autenticacion cambiado.',
      header,
    });
    return res
      .status(HttpCode.HTTP_OK)
      .send({ message: 'Se ha modificado el metodo de autenticación con exito!' });
  }

  static async updatePrimaryMethod(req, res) {
    const { id_method: idMethod } = req.params;
    const idUser = req.usuario.id;
    const authMethod = await MetodoAutenticacionUsuario.findOne({
      where: {
        id_usuario: idUser,
        id_metodo: idMethod,
      },
    });
    if (authMethod.id_auth_method_status === 2) {
      throw new UnprocessableEntityException(
        'No es posible seleccionar este método de autenticación debido a que no esta verificado',
      );
    }
    await MetodoAutenticacionUsuario.update(
      { is_primary: false },
      {
        where: {
          id: {
            [Op.not]: authMethod.id,
          },
          id_usuario: req.usuario.id,
        },
      },
    );
    await authMethod.update({ is_primary: true });
    const header = [
      {
        tagName: 'mj-text',
        attributes: {
          width: '80%',
          padding: '5px 10px',
          'font-size': '20px',
          'background-color': '#175efb',
          'border-radius': '99px',
        },
        content: 'Se ha cambiado el método de autenticación primario',
      },
    ];
    await Mailer.sendMail({
      email: req.usuario.email,
      subject: 'Alerta de actualización de cuenta.',
      header,
    });
    return res.status(HttpCode.HTTP_OK).send({ message: 'Solicitud procesada con exito!' });
  }

  static async getMetodosUsuario(req, res) {
    const methods = await MetodoAutenticacion.findAll({
      include: [
        {
          model: MetodoAutenticacionUsuario,
          required: false,
          where: {
            id_usuario: req.usuario.id,
          },
        },
      ],
    });

    return res.status(HttpCode.HTTP_OK).json(methods);
  }
}
