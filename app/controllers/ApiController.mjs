import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { Op } from 'sequelize';
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
import Storage from '../nucleo/Storage.mjs';

export default class ApiController {
  static async confirmUser(req, res) {
    const { token } = req.params;
    if (token) {
      const { idUsuario } = jwt.verify(token, process.env.SECRET_KEY);
      if (idUsuario) {
        await Usuario.update(
          { is_suspended: false, last_login: moment().tz('America/El_Salvador').format() },
          { where: { id: idUsuario } },
        );
        res.status(HttpCode.HTTP_OK).send({ message: 'El usuario ha sido verificado con exito' });
      } else {
        throw BadRequestException(
          'El id de usuario es requerido',
        );
      }
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({
      where: {
        email,
      },
      attributes: ['id', 'email', 'password', 'is_suspended', 'last_login'],
      include: [
        {
          model: MetodoAutenticacion,
          attributes: ['id', 'nombre', 'icono'],
          through: { attributes: ['is_primary'], where: { secret_key: { [Op.ne]: null } } },
        },
      ],
    });

    if (!usuario) {
      throw new NoAuthException(
        'Credenciales no validas',
      );
    }
    const validPassword = bcrypt.compareSync(password, usuario.password);
    if (!validPassword) {
      throw new NoAuthException(
        'Credenciales no validas',
      );
    }
    if (usuario.is_suspended && usuario.last_login !== null && usuario.last_login !== '') {
      throw new NoAuthException(
        'El usuario se encuentra suspendido',
      );
    }
    if ((usuario.last_login === '' && process.env.DISABLE_TWO_FACTOR_AUTH === 'false') || (usuario.last_login === null && process.env.DISABLE_TWO_FACTOR_AUTH === 'false')) {
      const idUsuario = usuario.id;
      const token = await Auth.createToken({ idUsuario });
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

      await Mailer.sendMail(
        usuario.email,
        null,
        'Verificacion de correo electronico',
        null,
        htmlForEmail,
      );
      return res.status(HttpCode.HTTP_BAD_REQUEST).json({
        message:
          'Su cuenta se encuentra suspendida, por favor verificarla por medio del correo que se le ha enviado',
      });
    }
    await usuario.update({
      last_login: moment().tz('America/El_Salvador').format(),
      two_factor_status: false,
    });
    const metodosAutenticacion = usuario.MetodoAutenticacions.map((row) => ({
      nombre: row.nombre,
      descripcion: row.descripcion,
      icono: row.icono,
      id: row.id,
      is_primary: row.MetodoAutenticacionUsuario.is_primary,
    }));

    const roles = await getRols.roles(usuario.id);
    const userDatatoken = {
      id: usuario.id, email: usuario.email, last_login: usuario.last_login, two_factor_status: usuario.two_factor_status,
    };
    const token = await Auth.createToken({
      id: usuario.id,
      roles: process.env.DISABLE_TWO_FACTOR_AUTH === 'true' ? roles : null,
      email: usuario.email,
      user: process.env.DISABLE_TWO_FACTOR_AUTH === 'true' ? (userDatatoken) : null,
    });
    if (process.env.DISABLE_TWO_FACTOR_AUTH === 'true') {
      const refreshToken = await Auth.refresh_token(usuario);
      return res.status(HttpCode.HTTP_OK).json({
        token,
        refreshToken,
      });
    }
    return res.status(HttpCode.HTTP_OK).json({
      token,
      metodos_autenticacion: metodosAutenticacion,
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
    let { id_metodo: idMetodo } = req.body;
    let { authorization } = req.headers;
    authorization = authorization.split(' ');
    if (!authorization.length < 2) {
      const receivedToken = authorization[1];
      const { id, email } = jwt.verify(receivedToken, process.env.SECRET_KEY);
      if (!idMetodo || idMetodo == null || idMetodo === '') {
        const getPrimaryMethod = await MetodoAutenticacionUsuario.findOne({
          where: { id_usuario: id, is_primary: true },
        });
        if (!getPrimaryMethod) {
          throw new NotFoundException(
            'Error al realizar la peticion...',
          );
        }
        idMetodo = getPrimaryMethod.id_metodo;
      }
      if (idMetodo === 1) {
        const newToken = speakeasy.generateSecret({ length: 52 }).base32;
        await MetodoAutenticacionUsuario.update(
          { secret_key: newToken },
          { where: { id_metodo: idMetodo, id_usuario: id } },
        );
        const verificationCode = await speakeasy.totp({
          secret: newToken,
          encoding: 'base32',
          time: process.env.GOOGLE_AUTH_TIME_EMAIL,
        });
        await Mailer.sendMail(
          email,
          verificationCode,
          'Codigo de verificacion de usuario',
          'El codigo de verificacion es:',
        );
        return res
          .status(HttpCode.HTTP_OK)
          .send({ message: 'Se ha enviado el codigo de verificacion a su correo electronico' });
      }
      next();
      throw new NotFoundException(
        'Error al realizar la peticion...',
      );
    }
    throw new NoAuthException(
      'La informacion no es valida',
    );
  }

  // eslint-disable-next-line consistent-return
  static async verifyTwoFactorAuthLogin(req, res) {
    let dbQueryParams;
    let { authorization } = req.headers;
    const { id_metodo: idMetodo, codigo } = req.body;
    authorization = authorization.split(' ');
    if (!authorization.length < 2) {
      const receivedToken = authorization[1];
      const { id } = jwt.verify(receivedToken, process.env.SECRET_KEY);
      if (!idMetodo) dbQueryParams = { id_usuario: id, is_primary: true };
      else dbQueryParams = { id_usuario: id, id_metodo: idMetodo };
      const metodoAutenticacion = await MetodoAutenticacionUsuario.findOne({
        where: dbQueryParams,
      });
      // validar si existe metodo de autenticacion
      if (!metodoAutenticacion) {
        throw new NoAuthException(
          'El usuario no posee metodos de autenticacion',
        );
      }
      const usuario = await Usuario.findOne({
        where: { id },
        attributes: ['id', 'email', 'last_login', 'two_factor_status'],
      });
      let timeToCodeValid = null;
      if (Number(metodoAutenticacion.id_metodo) === 1) {
        timeToCodeValid = process.env.GOOGLE_AUTH_TIME_EMAIL;
      }
      const isCodeValid = await Security.verifyTwoFactorAuthCode(
        codigo,
        metodoAutenticacion.secret_key,
        timeToCodeValid,
      );
      if (!isCodeValid) {
        throw new NoAuthException(
          'El codigo proporcionado no es valido',
        );
      }
      await usuario.update({
        two_factor_status: true,
        last_login: moment().tz('America/El_Salvador').format(),
        token_valid_after: moment().subtract(5, 's').tz('America/El_Salvador').format(),
      });

      const roles = getRols.roles(id);
      const refreshToken = await Auth.refresh_token(usuario);
      const token = await Auth.createToken({
        id,
        roles,
        email: usuario.email,
        user: usuario,
      });
      return res.status(HttpCode.HTTP_OK).send({
        token,
        refreshToken,
        '2fa': usuario.two_factor_status,
      });
    }
  }

  static async RefreshToken(req, res) {
    const refreshTokenExist = await RefreshToken.findOne({
      where: {
        refresh_token: req.body.refresh_token,
      },
      attributes: ['id'],
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
    const tokenValidTime = new Date(moment(refreshTokenExist.valid).format()).getTime();
    const nowTime = new Date(moment().tz('America/El_Salvador').format()).getTime();
    if (tokenValidTime < nowTime) {
      throw new NoAuthException(
        'El refresh token porporcionado no es valido',
      );
    }

    const { Usuario: usuario } = refreshTokenExist;

    const userDatatoken = {
      id: usuario.id,
      username: usuario.username,
      last_login: usuario.last_login,
      two_factor_status: usuario.two_factor_status,
    };

    const token = await Auth.createToken({
      id: refreshTokenExist.Usuario.id,
      email: refreshTokenExist.Usuario.email,
      roles,
      user: userDatatoken,
    });

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
      throw new UnprocessableEntityException(
        'El parametro no es un correo valido',
      );
    }

    const token = await Auth.createToken({
      id: usuario.id,
      email: usuario.email,
    });

    await Auth.refresh_token(usuario);

    await usuario.update(
      { token_valid_after: moment().tz('America/El_Salvador').format() },
      { where: { id: usuario.id } },
    );

    const uri = `http://${process.env.URL}/api/recovery_password/${token}`;
    const message = `
    <mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-image src="https://next.salud.gob.sv/index.php/s/AHEMQ38JR93fnXQ/download" width="350px"></mj-image>
           
        
              <mj-text  align="center" font-weight="bold" font-size="30px" color="#175efb">Recuperación de Contraseña</mj-text>
        <mj-spacer css-class="primary"></mj-spacer>
        <mj-divider border-width="3px" border-color="#175efb" />
        <mj-text align="center" font-size="18px"><h3>¿Una nueva contraseña?</h3>
            <p>Haz clic al siguiente boton y crea una nueva.</p>
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      
      <mj-column>
        
        <mj-button href=" ${uri}" width="80%" padding="5px 10px" font-size="20px" background-color="#175efb" border-radius="99px">
          Cambiar contraseña
         </mj-button>
        <mj-text align="justify">
          <p>Si no solicitaste el cambio de contraseña, ignora este correo. Tu contraseña continuará siendo la misma.</p>
         </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
    if (!Mailer.sendMail(usuario.email, null, 'Restablecer Contraseña', null, message)) {
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

  static async subirArchivo(req, res) {
    // const deleteImage = await Storage.deleteFile('4c31ed8457756a42e98fec0f5d24a136c9e7108e.jpg', 's3');

    // console.log(deleteImage);

    const busquedaImagen = await Storage.getFile('8227c5e0585bd37861cf91558c1fa215b2475c38.jpg', 's3');

    // const imagen = await Storage.disk('s3').put({
    //   file: busquedaImagen,
    // });

    // const listaImagenes = await Storage.getFiles('s3');

    // if (!imagen) {
    //   throw new UnprocessableEntityException('No se ha podido subir la imagen');
    // }

    res.setHeader('Content-Type', 'image/jpeg');
    return res.status(HttpCode.HTTP_OK).send(busquedaImagen.getBuffer());
  }
}
