import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import {
  Usuario, RefreshToken,
// eslint-disable-next-line import/no-unresolved
} from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import NoAuthException from '../../handlers/NoAuthException.mjs';
import Auth from '../utils/Auth.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import Mailer from '../services/mailer.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import getRols from '../services/getRols.mjs';
import MetodoAutenticacionUsuario from '../models/MetodoAutenticacionUsuario.mjs';
import Security from '../services/security.mjs';

export default class ApiController {
  static async confirmUser(req, res) {
    const { token } = req.params;
    if (token) {
      const { id } = jwt.verify(token, process.env.SECRET_KEY);
      if (id) {
        await Usuario.update({ is_suspended: false }, { where: { id } });
        res.status(HttpCode.HTTP_OK).send({ message: 'El usuario ha sido verificado con exito' });
      } else {
        throw NotFoundException('NOT_FOUND', HttpCode.HTTP_BAD_REQUEST, 'Error al realizar la peticion...');
      }
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({
      where: {
        email,
        is_suspended: false,
      },
    });

    if (!usuario) throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'Credenciales no validas');

    const validPassword = bcrypt.compareSync(password, usuario.password);
    if (!validPassword) {
      throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'Credenciales no validas');
    }

    await usuario.update({ last_login: moment().tz('America/El_Salvador').format() });

    const token = await Auth.createToken({
      id: usuario.id,
      email: usuario.email,
    });
    const refreshToken = await Auth.refresh_token(usuario);
    return res.status(HttpCode.HTTP_OK).json({
      token,
      refreshToken,
      user: usuario,
    });
  }

  // eslint-disable-next-line camelcase
  static async twoFactorAuthLoginChoose(req, res, next) {
    // eslint-disable-next-line camelcase,prefer-const
    let { id_metodo, email } = req.body;
    let { authorization } = req.headers;
    authorization = authorization.split(' ');
    if (!authorization.length < 2) {
      const receivedToken = authorization[1];
      const { id } = jwt.verify(receivedToken, process.env.SECRET_KEY);
      // eslint-disable-next-line camelcase
      if (!id_metodo || id_metodo == null || id_metodo === '') {
        const getPrimaryMethod = await MetodoAutenticacionUsuario.findOne({ where: { id_usuario: id, is_primary: true } });
        if (!getPrimaryMethod) throw new NotFoundException('NOT_FOUND', HttpCode.HTTP_BAD_REQUEST, 'Error al realizar la peticion...');
        // eslint-disable-next-line camelcase
        id_metodo = getPrimaryMethod.id_metodo;
      }
      // eslint-disable-next-line camelcase
      if (id_metodo === 1) {
        const newToken = speakeasy.generateSecret({ length: 52 }).base32;
        // eslint-disable-next-line camelcase
        await MetodoAutenticacionUsuario.update({ secret_key: newToken }, { where: { id_metodo, id_usuario: id } });
        const verificationCode = await speakeasy.totp({ secret: newToken, encoding: 'base32', time: process.env.GOOGLE_AUTH_TIME_EMAIL });
        await Mailer.sendMail(email, verificationCode, 'Codigo de verificacion de usuario', 'El codigo de verificacion es:');
        return res.status(HttpCode.HTTP_OK).send({ message: 'Se ha enviado el codigo de verificacion a su correo electronico' });
      }
      next();
      throw new NotFoundException('NOT_FOUND', HttpCode.HTTP_BAD_REQUEST, 'Error al realizar la peticion...');
    }
    throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'La informacion no es valida');
  }

  static async verifyTwoFactorAuthLogin(req, res) {
    let dbQueryParams;
    let { authorization } = req.headers;
    // eslint-disable-next-line camelcase
    const { id_metodo, codigo } = req.body;
    authorization = authorization.split(' ');
    if (!authorization.length < 2) {
      const receivedToken = authorization[1];
      const { id } = jwt.verify(receivedToken, process.env.SECRET_KEY);
      // eslint-disable-next-line camelcase
      if (!id_metodo) dbQueryParams = { id_usuario: id, is_primary: true };
      // eslint-disable-next-line camelcase
      else dbQueryParams = { id_usuario: id, id_metodo };
      // eslint-disable-next-line camelcase,no-shadow
      const metodoAutenticacion = await MetodoAutenticacionUsuario.findOne({ where: dbQueryParams });
      // validar si existe metodo de autenticacion
      if (!metodoAutenticacion) throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'El usuario no posee metodos de autenticacion');
      const usuario = await Usuario.findOne({
        where: { id },
      });
      let timeToCodeValid = null;
      // eslint-disable-next-line camelcase,no-unused-expressions
      if (Number(id_metodo) === 1)timeToCodeValid = process.env.GOOGLE_AUTH_TIME_EMAIL;
      const isCodeValid = await Security.verifyTwoFactorAuthCode(codigo, metodoAutenticacion.secret_key, timeToCodeValid);
      if (!isCodeValid) throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'El codigo proporcionado no es valido');
      const roles = getRols.roles(id);
      const refreshToken = await Auth.refresh_token(usuario);
      const token = await Auth.createToken({
        id,
        roles,
        email: usuario.email,
      });
      res.status(HttpCode.HTTP_OK).send({
        token,
        refreshToken,
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
        }],
    });

    if (!refreshTokenExist) throw new NotFoundException('NOT_FOUND', HttpCode.HTTP_BAD_REQUEST, 'Error al realizar la peticion...');
    const roles = await getRols.roles(refreshTokenExist.Usuario.id);
    const tokenValidTime = new Date(moment(refreshTokenExist.valid).format()).getTime();
    const nowTime = new Date(moment().tz('America/El_Salvador').format()).getTime();
    if (tokenValidTime < nowTime) throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'El refresh token porporcionado no es valido');
    const token = await Auth.createToken({
      id: refreshTokenExist.Usuario.id,
      email: refreshTokenExist.Usuario.email,
      roles,
    });

    const newRefreshToken = await Auth.refresh_token(refreshTokenExist.Usuario);
    await refreshTokenExist.update({
      valid: moment().add(process.env.REFRESH_TOKEN_INVALID_EXPIRATION_TIME, process.env.REFRESH_TOKEN_INVALID_EXPIRATION_TYPE).tz('America/El_Salvador').format(),
    });
    await Usuario.update({
      token_valid_after: moment().add(process.env.REFRESH_TOKEN_INVALID_EXPIRATION_TIME, process.env.REFRESH_TOKEN_INVALID_EXPIRATION_TYPE).tz('America/El_Salvador').format(),
    }, { where: { id: refreshTokenExist.Usuario.id } });
    return res.status(HttpCode.HTTP_OK).json({
      token,
      refresh_token: newRefreshToken,
      user: refreshTokenExist.Usuario,
    });
  }

  static async recoveryPasswordSendEmail(req, res) {
    const usuario = await Usuario.findOne(
      {
        where: {
          email: req.params.email,
          is_suspended: false,
        },
      },
    );
    if (usuario === null) { throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un correo valido'); }

    const token = await Auth.createToken({
      id: usuario.id,
      email: usuario.email,
    });

    // eslint-disable-next-line no-unused-vars
    const refreshToken = await Auth.refresh_token(usuario);

    await usuario.update({ token_valid_after: moment().tz('America/El_Salvador').format() }, { where: { id: usuario.id } });

    const uri = `${process.env.URL}/api/recovery_password/${token}`;

    if (!Mailer.sendMail(usuario.email, `Ingrese al siguiente enlace: ${uri}`, 'Restablecer Contraseña', '¿Olvidaste tu contraseña?')) {
      throw new NotFoundException('NOT_FOUND', 400, 'Error! Hubo un problema al enviar el correo, intente nuevamente.');
    }

    return res.status(HttpCode.HTTP_OK).json({ message: 'El correo ha sido enviado' });
  }

  static async recoveryPassword(req, res) {
    const { password, confirmPassword, token } = req.body;

    const salt = bcrypt.genSaltSync();
    const passwordCrypt = bcrypt.hashSync(password, salt);

    if (password !== confirmPassword) { throw new NotFoundException('NOT_FOUND', 400, 'Error! Contraseña incorrecta'); }

    const decoded = jwt.decode(token, process.env.SECRET_KEY);

    // eslint-disable-next-line no-unused-vars
    const usuario = await Usuario.update(
      {
        password: passwordCrypt,
        token_valid_after: moment().tz('America/El_Salvador').format(),
      },
      {
        where: {
          id: decoded.id,
        },
      },
    );

    return res.status(HttpCode.HTTP_CREATED).json({
      message: 'contraseña actualizada',
    });
  }
}
