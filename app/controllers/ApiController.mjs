import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';
import {
  Usuario, RefreshToken,
// eslint-disable-next-line import/no-unresolved
} from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import NoAuthException from '../../handlers/NoAuthException.mjs';
import Auth from '../utils/Auth.mjs';
import BaseError from '../../handlers/BaseError.mjs';
import getRols from '../services/getRols.mjs';

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
      attributes: ['id'],
      include: [
        {
          model: Usuario,
          attributes: ['id', 'email', 'last_login'],
        }],
    });

    if (!refreshTokenExist) throw new BaseError('NOT_FOUND', HttpCode.HTTP_BAD_REQUEST, 'Error al realizar la peticion...');
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
}
