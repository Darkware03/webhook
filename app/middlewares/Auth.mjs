import jwt from 'jsonwebtoken';
import NoAuthException from '../../handlers/NoAuthException.mjs';
import { Usuario } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import moment from 'moment';

// eslint-disable-next-line consistent-return
const Auth = async (req, res, next) => {
  try {
    let { authorization } = req.headers;
    if (!authorization) throw new NoAuthException();

    authorization = authorization.split(' ');
    if (authorization.length < 2) throw new NoAuthException();

    const token = authorization[1];
    const { id } = jwt.verify(token, process.env.SECRET_KEY);
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const fechaCreacionToken = new Date(moment(decoded.iat*1000).format()).getTime();

    const usuario = await Usuario.findOne({
      where: { id, is_suspended: false },
    });

    const fechaValidacionToken = new Date(moment(usuario.token_valid_after).format()).getTime();
    
    if (usuario.is_suspended) throw new NoAuthException();

     if(fechaValidacionToken >= fechaCreacionToken ){
      throw new NoAuthException(); 
     }

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
