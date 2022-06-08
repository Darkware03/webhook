import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { Usuario, RefreshToken } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import NoAuthException from '../../handlers/NoAuthException.mjs';
import Auth from '../utils/Auth.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import Mailer from '../services/mailer.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import getRols from '../services/getRols.mjs';
import MetodoAutenticacionUsuario from '../models/MetodoAutenticacionUsuario.mjs';
import Security from '../services/security.mjs';
import MetodoAutenticacion from '../models/MetodoAutenticacion.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';
import Handler from '../../handlers/Handler.mjs';

export default class ApiController {
  static async confirmUser(req, res) {
    const { token } = req.params;
    if (token) {
      const { idUsuario } = jwt.verify(token, process.env.SECRET_KEY);
      if (idUsuario) {
        await Usuario.update(
          {
            is_suspended: false,
            last_login: moment().tz('America/El_Salvador').format(),
            verified: true,
          },
          { where: { id: idUsuario } },
        );
        res.status(HttpCode.HTTP_OK).send({ message: 'El usuario ha sido verificado con exito' });
      } else {
        throw BadRequestException('El id de usuario es requerido');
      }
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({
      where: {
        email,
      },
      attributes: [
        'id',
        'email',
        'password',
        'is_suspended',
        'last_login',
        'verified',
        'two_factor_status',
      ],
      include: [
        {
          model: MetodoAutenticacion,
          attributes: ['id', 'nombre', 'icono'],
          through: { attributes: ['is_primary', 'id'] },
        },
      ],
    });

    if (!usuario) throw new NoAuthException('Credenciales no validas');

    const frontAdmin = process.env.FRONT_ADMIN_HOST.split('||');
    if (frontAdmin.includes(req.headers.origin)) {
      if (!(await Security.isGranted(usuario.id, 'ROLE_USER_ADMIN'))) throw new NoAuthException();
    }

    const validPassword = bcrypt.compareSync(password, usuario.password);
    if (!validPassword) throw new NoAuthException('Credenciales no validas');

    if (!usuario.verified) {
      const idUsuario = usuario.id;
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
            href: `${process.env.FRONT_URL}/verify-mail/${token}`,
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
      return res.status(HttpCode.HTTP_BAD_REQUEST).json({
        message:
          'Su cuenta se encuentra suspendida, por favor verificarla por medio del correo que se le ha enviado',
      });
    }

    if (usuario.is_suspended) {
      throw new NoAuthException('El usuario se encuentra suspendido');
    }

    await usuario.update({
      last_login: moment().tz('America/El_Salvador').format(),
    });
    const metodosAutenticacion = usuario.MetodoAutenticacions.map((row) => ({
      nombre: row.nombre,
      descripcion: row.descripcion,
      icono: row.icono,
      id: row.id,
      is_primary: row.MetodoAutenticacionUsuario.is_primary,
      id_metodo_usuario: row.MetodoAutenticacionUsuario.id,
    }));

    const primaryMethod = metodosAutenticacion.find((item) => item.is_primary);

    const roles = await getRols.roles(usuario.id);
    const userInfo = {
      id: usuario.id,
      email: usuario.email,
      last_login: usuario.last_login,
      two_factor_status: usuario.two_factor_status,
    };

    const response = {};
    const tokenInfo = {
      user: userInfo,
    };

    if (!usuario.two_factor_status) {
      tokenInfo.roles = roles;
      response.refreshToken = await Auth.refresh_token(usuario);
    } else {
      response.metodos_autenticacion = metodosAutenticacion;
    }

    response.token = await Auth.createToken(
      tokenInfo,
      usuario.two_factor_status ? process.env.TWO_FACTOR_SECRET_KEY : process.env.SECRET_KEY,
    );

    if (primaryMethod?.id === 1 && usuario.two_factor_status) {
      await ApiController.sendEmailCode(usuario, primaryMethod.id);
    }

    return res.status(HttpCode.HTTP_OK).json(response);
  }

  static async sendCode(req, res) {
    const { email } = req.body;

    const usuario = await Usuario.findOne({
      where: {
        email,
      },
    });

    await ApiController.sendEmailCode(usuario, 1);

    return res.status(HttpCode.HTTP_OK).json({
      message: 'Se ha enviado el codigo a su correo electrónico',
    });
  }

  static async sendEmailCode(user, idMethod) {
    const { secret_key: secretKey } = await MetodoAutenticacionUsuario.findOne({
      where: {
        id_usuario: user.id,
        id_metodo: idMethod,
      },
      attributes: ['secret_key'],
    });
    const code = speakeasy.totp({
      secret: secretKey,
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
      email: user.email,
      header,
      subject: 'Codigo de verificacion de usuario',
      message: code,
    });
  }

  static async logout(req, res) {
    await Usuario.update(
      {
        token_valid_after: moment().tz('America/El_Salvador').format(),
        two_factor_status: false,
      },
      { where: { id: req.usuario.id } },
    );
    return res.status(HttpCode.HTTP_OK).send({});
  }

  static async twoFactorAuthLoginChoose(req, res, next) {
    const { id_metodo: idMetodo } = req.body;
    const { authorization } = req.headers;
    const token = authorization && authorization.replace('Bearer ', '');

    if (!token) throw new NoAuthException('No autenticado');

    try {
      const { id, email } = jwt.verify(token, process.env.SECRET_KEY);
      const authMethod = await MetodoAutenticacionUsuario.findOne({
        where: {
          id_usuario: id,
          id_metodo: idMetodo,
        },
      });

      if (idMetodo === 1) {
        const newToken = speakeasy.generateSecret({ length: 52 }).base32;
        await authMethod.update({
          secret_key: newToken,
        });

        const verificationCode = speakeasy.totp({
          secret: newToken,
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
          email,
          header,
          subject: 'Codigo de verificacion de usuario',
          message: verificationCode,
        });
      }

      return res
        .status(HttpCode.HTTP_OK)
        .send({ message: 'Se ha enviado el codigo de verificacion a su correo electronico' });
    } catch (e) {
      return Handler.handlerError(e, req, res, next);
    }
  }

  static async verifyTwoFactorAuthCode(req, res) {
    const { code, id_method: idMethod } = req.body;
    const idUser = req.usuario.id;

    const user = await Usuario.findByPk(idUser);

    const authMethod = await MetodoAutenticacionUsuario.findOne({
      where: {
        id_usuario: user.id,
        id_metodo: idMethod,
      },
    });

    if (!authMethod) throw new NoAuthException('Metodo de autenticación no configurado');
    if (authMethod.id_auth_method_status === 2) throw new NoAuthException('El metodo de autenticación no ha sido verificado');

    const params = {
      code,
      secretKey: authMethod.secret_key,
    };

    if (authMethod.id_metodo === 1) {
      params.time = process.env.TIME_BASED_TOKEN_2FA;
      params.step = 10;
    }

    const isValid = await Security.verifyTwoFactorAuthCode(params);
    if (!isValid) throw new NoAuthException('El codigo proporcionado no es valido');

    await user.update({
      two_factor_status: true,
      last_login: moment().tz('America/El_Salvador').format(),
      token_valid_after: moment().subtract(5, 's').tz('America/El_Salvador').format(),
    });

    const roles = await getRols.roles(user.id);
    const refreshToken = await Auth.refresh_token(user);
    const newToken = await Auth.createToken(
      {
        id: user.id,
        roles,
        user,
        email: user.email,
      },
      process.env.SECRET_KEY,
    );
    return res.status(HttpCode.HTTP_OK).send({
      token: newToken,
      refreshToken,
      '2fa': user.two_factor_status,
    });
  }

  static async RefreshToken(req, res) {
    const refreshTokenExist = await RefreshToken.findOne({
      where: {
        refresh_token: req.body.refresh_token,
      },
      attributes: ['id', 'valid'],
      include: [
        {
          model: Usuario,
          attributes: ['id', 'email', 'last_login'],
        },
      ],
    });
    if (!refreshTokenExist) {
      throw new NoAuthException();
    }
    const roles = await getRols.roles(refreshTokenExist.Usuario.id);
    const tokenValidTime = moment(refreshTokenExist.valid).valueOf();
    const nowTime = moment().tz('America/El_Salvador').valueOf();
    if (tokenValidTime < nowTime) {
      throw new NoAuthException('El refresh token porporcionado no es valido');
    }

    const { Usuario: usuario } = refreshTokenExist;

    const userDatatoken = {
      id: usuario.id,
      email: usuario.email,
      last_login: usuario.last_login,
      two_factor_status: usuario.two_factor_status,
    };

    const token = await Auth.createToken(
      {
        roles,
        user: userDatatoken,
      },
      process.env.SECRET_KEY,
    );

    const newRefreshToken = await Auth.refresh_token(refreshTokenExist.Usuario);
    await refreshTokenExist.update({
      valid: moment()
        .add(
          process.env.REFRESH_TOKEN_INVALID_EXPIRATION_TIME,
          process.env.REFRESH_TOKEN_INVALID_EXPIRATION_TYPE,
        )
        .tz('America/El_Salvador')
        .format(),
    });

    return res.status(HttpCode.HTTP_OK).json({
      token,
      refresh_token: newRefreshToken,
      user: refreshTokenExist.Usuario,
    });
  }

  static async recoveryPasswordSendEmail(req, res) {
    const usuario = await Usuario.findOne({
      where: {
        email: req.params.email,
        is_suspended: false,
      },
    });
    if (usuario === null) {
      throw new UnprocessableEntityException('El parametro no es un correo valido');
    }

    const token = await Auth.createToken(
      {
        id: usuario.id,
        email: usuario.email,
      },
      process.env.SECRET_KEY,
    );

    await Auth.refresh_token(usuario);

    await usuario.update(
      { token_valid_after: moment().tz('America/El_Salvador').format() },
      { where: { id: usuario.id } },
    );

    const uri = `http://${process.env.URL}/api/recovery_password/${token}`;

    const header = [
      {
        tagName: 'mj-text',
        attributes: {
          align: 'center',
          'font-size': '30px',
          'font-weight': 'bold',
          color: '#175efb',
        },
        content: 'Recuperación de Contraseña',
      },
      {
        tagName: 'mj-spacer',
        attributes: {
          'css-class': 'primary',
        },
      },
      {
        tagName: 'mj-divider',
        attributes: {
          'border-width': '3px',
          'border-color': '#175efb',
        },
      },
      {
        tagName: 'mj-text',
        attributes: {
          align: 'center',
          'font-size': '18px',
        },
        children: [
          {
            tagName: 'h3',
            content: '¿Una nueva contraseña?',
            children: [
              {
                tagName: 'p',
                content: 'Haz clic al siguiente boton y crea una nueva.',
              },
            ],
          },
        ],
      },
    ];

    const sections = [
      {
        tagName: 'mj-column',
        attributes: {},
        children: [
          {
            tagName: 'mj-button',
            attributes: {
              href: uri,
              width: '80%',
              padding: '5px 10px',
              'font-size': '20px',
              'background-color': '#175efb',
              'border-radius': '99px',
            },
            content: 'Cambiar contraseña',
          },
          {
            tagName: 'mj-text',
            attributes: {
              align: 'justify',
            },
            children: [
              {
                tagName: 'p',
                content:
                  'Si no solicitaste el cambio de contraseña, ignora este correo. Tu contraseña continuará siendo la misma.',
              },
            ],
          },
        ],
      },
    ];

    if (
      !Mailer.sendMail({
        email: usuario.email,
        header,
        subject: 'Restablecer Contraseña',
        sections,
      })
    ) {
      throw new NotFoundException(
        'Error! Hubo un problema al enviar el correo, intente nuevamente.',
      );
    }

    return res.status(HttpCode.HTTP_OK).json({ message: 'El correo ha sido enviado' });
  }

  static async recoveryPassword(req, res) {
    const { password, confirmPassword } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const salt = bcrypt.genSaltSync();
    const passwordCrypt = bcrypt.hashSync(password, salt);

    if (password !== confirmPassword) {
      throw new NotFoundException('Error! Las contraseñas  no coinciden');
    }
    const { user } = jwt.verify(token, process.env.SECRET_KEY);

    await Usuario.update(
      {
        password: passwordCrypt,
        token_valid_after: moment().tz('America/El_Salvador').format(),
      },
      {
        where: {
          id: user.id,
        },
      },
    );

    return res.status(HttpCode.HTTP_OK).json({
      message: 'contraseña actualizada',
    });
  }

  static async sendVerificationToken(req, res) {
    const { email } = req.body;
    const usuario = await Usuario.findOne({
      where: {
        email,
      },
    });

    const idUsuario = usuario.id;
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
      subject: 'Verificación de correo electrónico',
      message: 'Para verificar tu cuenta debes de hacer click en el siguiente enlace:',
      body,
    });

    return res.status(HttpCode.HTTP_BAD_REQUEST).json({
      message: 'Se ha reenviado el correo con el token de verificación',
    });
  }
}
