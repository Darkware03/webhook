import jwt from 'jsonwebtoken';
import moment from 'moment';
import NoAuthException from '../../handlers/NoAuthException.mjs';
import { Usuario } from '../models/index.mjs';
import Handler from '../../handlers/Handler.mjs';

// eslint-disable-next-line consistent-return
const Auth2FA = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new NoAuthException();

    const token = authorization.replace('Bearer ', '');

    const { id, iat } = jwt.verify(token, process.env.TWO_FACTOR_SECRET_KEY);
    const fechaCreacionToken = iat * 1000;

    const usuario = await Usuario.findOne({
      where: { id, is_suspended: false },
    });

    if (!usuario) throw new NoAuthException();

    const fechaValidacionToken = moment(usuario.token_valid_after).valueOf();

    if (fechaValidacionToken > fechaCreacionToken) throw new NoAuthException();

    req.usuario = usuario;

    next();
  } catch (err) {
    Handler.handlerError(err, req, res, next);
  }
};

export default Auth2FA;
