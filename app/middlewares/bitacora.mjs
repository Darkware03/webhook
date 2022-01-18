import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import mongooseDb from '../nucleo/mongo/connection.mjs';
import bitacoraSchema from '../nucleo/mongo/bitacora.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import { Usuario } from '../models/index.mjs';
import NoAuthException from '../../handlers/NoAuthException.mjs';

// starting connection
mongooseDb.connection();
// const conn = mongoose.connect('mongodb+srv://miguel:123@cluster0.gkgbe.mongodb.net/test');
const Bitacora = mongoose.model('bitacora', bitacoraSchema, 'bitacora');

// req.connection.remoteAddress
// req.connection.remotePort
// req.connection.localAddress
// req.connection.localPort

// eslint-disable-next-line consistent-return
const Authentication = async (req, res, next) => {
  try {
    // getting the username
    let { authorization } = req.headers;
    if (!authorization) next(new NoAuthException());
    authorization = authorization.split(' ');
    if (authorization.length < 2) next(new NoAuthException());
    const token = authorization[1];
    const { id } = jwt.verify(token, process.env.SECRET_KEY);

    const usuario = await Usuario.findOne({
      where: { id, is_suspended: false },
    });

    if (usuario.is_suspended) next(new NoAuthException());

    // Bitacora.path('_id');
    const data = new Bitacora({
      id_usuario: usuario.id,
      ip_cliente: req.connection.localAddress,
      ip_servidor: req.connection.remoteAddress,
      metodo_http: req.method,
      request_headers: JSON.stringify(req.headers),
      request_uri: req.originalUrl,
      request_parameters: JSON.stringify(req.params),
      request_content: JSON.stringify(req.body),
      xrd_userid: usuario.email,
      xrd_messageid: 'message of data',
      xrd_cliente: 'xrd_cliente',
      xrd_service: 'xrd_service',

    });
    data.save()
      .then(() => {
        console.log(data);
        console.log('mongodb data enviada');
      });

    next();
  } catch (error) {
    return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({
      message: error,
    });
  }
};

export default Authentication;
