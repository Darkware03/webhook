import Bitacora from '../nucleo/mongo/bitacora.mjs';
import HttpCode from '../../configs/httpCode.mjs';

// eslint-disable-next-line consistent-return
const Authentication = async (req, res, next) => {
  try {
    const data = new Bitacora({
      id_usuario: req.usuario.id,
      ip_cliente: req.connection.localAddress,
      ip_servidor: req.connection.remoteAddress,
      metodo_http: req.method,
      request_headers: JSON.stringify(req.headers),
      request_uri: req.originalUrl,
      request_parameters: JSON.stringify(req.params),
      request_content: JSON.stringify(req.body),
      xrd_userid: req.usuario.email,
      xrd_messageid: 'xrd_messageid',
      xrd_cliente: 'xrd_cliente',
      xrd_service: 'xrd_service',

    });
    await data.save();

    next();
  } catch (error) {
    return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({
      message: error,
    });
  }
};

export default Authentication;
