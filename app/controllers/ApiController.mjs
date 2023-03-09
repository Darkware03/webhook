import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { Usuario } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import NoAuthException from '../../handlers/NoAuthException.mjs';
import Auth from '../utils/Auth.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import getRols from '../services/getRols.mjs';
import MetodoAutenticacionUsuario from '../models/MetodoAutenticacionUsuario.mjs';
import Security from '../services/security.mjs';
import MetodoAutenticacion from '../models/MetodoAutenticacion.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';
import Handler from '../../handlers/Handler.mjs';
import Cache from '../nucleo/Cache.mjs';
import addEmailQueue from '../jobs/queues/email.queue.mjs';

export default class ApiController {
  static async twoFactorList(req, res) {
    const authMethods = await MetodoAutenticacion.findAll();

    res.status(HttpCode.HTTP_OK).json(authMethods);
  }

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
        email: email.toLowerCase(),
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
          attributes: ['id', 'nombre', 'icono', 'descripcion'],
          through: {
            attributes: ['is_primary', 'id'],
          },
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
      ApiController.sendVerificationUserMail(usuario);

      return res.status(HttpCode.HTTP_OK).json({
        message: 'Por favor verificar la cuenta por medio del correo que se le ha enviado',
      });
    }

    if (usuario.is_suspended) throw new NoAuthException('El usuario se encuentra suspendido');

    await usuario.update({
      last_login: moment().tz('America/El_Salvador').format(),
    });

    const primaryMethod = usuario.MetodoAutenticacions.find((item) => item.MetodoAutenticacionUsuario.is_primary);

    const response = {};
    const tokenInfo = {
      user: usuario,
    };

    if (!usuario.two_factor_status) {
      response.refreshToken = await Auth.refresh_token(usuario);
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
    const { email } = req.usuario;

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
    const params = {
      email: user.email,
      header,
      subject: 'Codigo de verificacion de usuario',
      message: code,
    };
    await addEmailQueue(params);
  }

  static async logout(req, res) {
    await Usuario.update(
      {
        token_valid_after: moment().tz('America/El_Salvador').format(),
        two_factor_status: false,
      },
      { where: { id: req.usuario.id } },
    );
    return res.status(HttpCode.HTTP_OK).json();
  }

  static async twoFactorAuthLoginChoose(req, res, next) {
    const { id_metodo: idMetodo } = req.body;
    const { authorization } = req.headers;
    const token = authorization && authorization.replace('Bearer ', '');

    if (!token) throw new NoAuthException('No autenticado');

    try {
      const { user } = jwt.verify(token, process.env.TWO_FACTOR_SECRET_KEY);
      const authMethod = await MetodoAutenticacionUsuario.findOne({
        where: {
          id_usuario: user.id,
          id_metodo: idMetodo,
          verified: true,
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

        const params = {
          email: user.email,
          header,
          subject: 'Codigo de verificacion de usuario',
          message: verificationCode,
        };

        await addEmailQueue(params);
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
    if (!authMethod?.verified) throw new NoAuthException('El metodo de autenticación no ha sido verificado');

    const params = {
      code,
      secretKey: authMethod.secret_key,
    };

    if (authMethod.id_metodo === 1) {
      params.time = process.env.TIME_BASED_TOKEN_2FA;
      params.step = 10;
    }

    const isValid = await Security.verifyTwoFactorAuthCode(params);
    if (!isValid) throw new UnprocessableEntityException('El codigo proporcionado no es valido');

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
    const refreshTokenExist = await Cache.hGetAll(req.body.refresh_token);
    if (!refreshTokenExist) {
      throw new NoAuthException('El refresh token porporcionado no es valido');
    }
    const usuario = await Usuario.findByPk(refreshTokenExist.id_usuario);

    const token = await Auth.createToken(
      {
        user: usuario,
      },
      process.env.SECRET_KEY,
    );

    const newRefreshToken = await Auth.refresh_token(usuario);

    return res.status(HttpCode.HTTP_OK).json({
      token,
      refresh_token: newRefreshToken,
      user: usuario,
    });
  }

  static async resetPassword(req, res) {
    const usuario = await Usuario.findOne({
      where: {
        email: req.body.email,
        is_suspended: false,
      },
    });
    if (!usuario) throw new UnprocessableEntityException('El parametro no es un correo valido');

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

    const uri = `${process.env.FRONT_URL}/reset-password/${token}`;

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

    const params = {
      email: usuario.email,
      header,
      subject: 'Restablecer Contraseña',
      sections,
    };

    await addEmailQueue(params);

    return res.status(HttpCode.HTTP_OK).json({ message: 'El correo ha sido enviado' });
  }

  static async changePassword(req, res) {
    const { password, confirm_password: confirmPassword } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const salt = bcrypt.genSaltSync();
    if (password !== confirmPassword) {
      throw new NotFoundException('Error! Las contraseñas  no coinciden');
    }

    const passwordCrypt = bcrypt.hashSync(password, salt);
    const { id } = jwt.verify(token, process.env.SECRET_KEY);

    await Usuario.update(
      {
        password: passwordCrypt,
        token_valid_after: moment().tz('America/El_Salvador').format(),
      },
      {
        where: {
          id,
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

    const params = {
      email: usuario.email,
      header,
      subject: 'Verificación de correo electrónico',
      message: 'Para verificar tu cuenta debes de hacer click en el siguiente enlace:',
      body,
    };

    await addEmailQueue(params);

    return res.status(HttpCode.HTTP_BAD_REQUEST).json({
      message: 'Se ha reenviado el correo con el token de verificación',
    });
  }

  static async sendVerificationUserMail(usuario) {
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

    const params = {
      email: usuario.email,
      header,
      subject: 'Verificacion de correo electronico',
      message: 'Para verificar tu cuenta debes de hacer click en el siguiente enlace:',
      body,
    };

    await addEmailQueue(params);
  }

  static async singBox(req, res){
    // Obtener el documento del cuerpo de la solicitud
    const document = req.body;

    // Verificar la autenticidad del documento
    const isAuthentic = await ApiController.verifyDocument(document);

    if (!isAuthentic) {
      // Si el documento no es auténtico, devolver un error
      res.status(401).send('Documento no auténtico');
      return;
    }

    // Firmar el documento digitalmente
    const signedDocument = ApiController.signDocument(document);

    // Enviar la respuesta al webhook
    res.send(signedDocument);

  }

  static async verifyDocument(document) {
    // Implementar la lógica para verificar la autenticidad del documento
    // Utilice los algoritmos de seguridad y autenticación requeridos por PBS
    // Devolver true si el documento es auténtico, false en caso contrario
  }

  // Función para firmar el documento digitalmente
  static async  signDocument(document) {
    // Cargar el certificado digital para la firma digital
    const certFile = fs.readFileSync('cert.pfx');
    const cert = forge.util.decode64(certFile);

    // Obtener la clave privada del certificado
    const privateKey = forge.pki.decryptPrivateKey(cert, 'password');

    // Convertir el documento a formato de bytes
    const bytes = forge.util.encodeUtf8(JSON.stringify(document));

    // Crear un objeto de resumen del mensaje (hash)
    const md = forge.md.sha256.create();
    md.update(bytes);

    // Firmar el resumen del mensaje utilizando la clave privada
    const signature = privateKey.sign(md);

    // Convertir la firma a formato Base64
    const signatureBase64 = forge.util.encode64(signature);

    // Agregar la firma digital al documento
    document.signature = signatureBase64;

    // Devolver el documento firmado digitalmente
    return document;
  }
}
