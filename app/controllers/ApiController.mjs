import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';
import jwt from 'jsonwebtoken';
import {
  Usuario, Perfil, Rol, RefreshToken,
// eslint-disable-next-line import/no-unresolved
} from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import NoAuthException from '../../handlers/NoAuthException.mjs';
import Auth from '../utils/Auth.mjs';
import BaseError from '../../handlers/BaseError.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import Mailer from '../services/mailer.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';

export default class ApiController {
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

  static async RefreshToken(req, res) {
    const refreshTokenExist = await RefreshToken.findOne({
      where: {
        refresh_token: req.body.refresh_token,
      },
      attributes: [],
      include: [
        {
          model: Usuario,
          attributes: ['id', 'email', 'last_login'],
          include: [{
            model: Rol,
            attributes: ['name'],
            through: { attributes: [] },
          }, {
            model: Perfil,
            attributes: { exclude: ['nombre', 'codigo'] },
            through: { attributes: [] },
            include: [{
              model: Rol,
              attributes: ['name'],
              through: { attributes: [] },
            }],
          }],
        }],
    });

    if (!refreshTokenExist) throw new BaseError('NOT_FOUND', HttpCode.HTTP_BAD_REQUEST, 'Error al realizar la peticion...');

    const rolesPerfiles = refreshTokenExist.Usuario.Perfils.reduce((acumulador, valor) => [...valor.Rols], []);

    const roles = new Set(refreshTokenExist.Usuario.Rols.concat(rolesPerfiles).map((row) => row.name));

    const tokenValidTime = new Date(moment(refreshTokenExist.valid).format()).getTime();
    const nowTime = new Date(moment().tz('America/El_Salvador').format()).getTime();
    if (tokenValidTime < nowTime) throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'El refresh token porporcionado no es valido');
    const token = await Auth.createToken({
      email: refreshTokenExist.Usuario.email,
      roles: [...roles],
    });

    const newRefreshToken = await Auth.refresh_token(refreshTokenExist.Usuario);

    await refreshTokenExist.update({
      valid: moment().add(process.env.REFRESH_TOKEN_INVALID_EXPIRATION_TIME, process.env.REFRESH_TOKEN_INVALID_EXPIRATION_TYPE).tz('America/El_Salvador').format(),
    });

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
      console.log('No se envio');
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
