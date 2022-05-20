import jwt from 'jsonwebtoken';
import moment from 'moment';
import NoAuthException from '../../handlers/NoAuthException.mjs';
import { Usuario } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';

// eslint-disable-next-line consistent-return
const Auth = async (req, res, next) => {
  try {
    let { authorization } = req.headers;
    if (!authorization) throw new NoAuthException();

    authorization = authorization.split(' ');
    if (authorization.length < 2) throw new NoAuthException();

    const token = authorization[1];
    const { user, iat } = jwt.verify(token, process.env.SECRET_KEY);
    const fechaCreacionToken = iat * 1000;

    const usuario = await Usuario.findOne({
      where: { id: user.id, is_suspended: false },
    });

    if (!usuario) throw new NoAuthException();
    const fechaValidacionToken = moment(usuario.token_valid_after).valueOf();

    if (fechaValidacionToken > fechaCreacionToken) throw new NoAuthException();

    if (!usuario.two_factor_status && process.env.DISABLE_TWO_FACTOR_AUTH === 'false') throw new NoAuthException();
    req.usuario = usuario;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(HttpCode.HTTP_UNAUTHORIZED).json({
        message: 'No authenticado',
      });
    }

    return res.status(err.statusCode || HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({
      message: err.message,
    });
  }
};

export default Auth;
