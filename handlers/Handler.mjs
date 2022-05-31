import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';
import ErrorModel from '../app/nucleo/mongo/error.mjs';
import BadRequestException from './BadRequestException.mjs';
import NoAuthException from './NoAuthException.mjs';

export default class Handler {
  static logError(req, err) {
    if (req.usuario) {
      const Error = new ErrorModel({
        id_bitacora: req.bitacora ? req.bitacora.id : null,
        codigo: err.statusCode,
        mensaje: err.message,
        trace: err.stack,
        content: err,

      });
      Error.save();
    }
  }

  static logErrorMiddleware(err, req, res, next) {
    Handler.logError(req, err);
    next(err);
  }

  // eslint-disable-next-line consistent-return,no-unused-vars
  static handlerError(err, req, res, next) {
    const debug = process.env.APP_DEBUG === 'true';
    if (debug) return res.status(err.statusCode || HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({ err, stack: err.stack });
    if (err.name && err.name === 'JsonSchemaValidation') return res.status(HttpCode.HTTP_BAD_REQUEST).json(debug ? err : err.validations.body);

    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(HttpCode.HTTP_BAD_REQUEST).json(debug ? err : err.errors.map((row) => ({
        field: row.path,
        message: row.message,
      })));
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json(debug ? err : { message: 'No se puede eliminar uno o más registros debido a que tienen acciones asociadas al sistema' });
    }

    if (err.name === 'JsonWebTokenError') {
      let message;
      if (err.message === 'jwt malformed') message = 'El token no es valido';
      if (err.message === 'invalid signature') message = 'La firma no es valida';

      throw new BadRequestException(message);
    }
    if (err.name === 'TokenExpiredError') throw new NoAuthException('No autenticado');

    return res.status(err.statusCode || HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({
      message: 'Ha ocurrido un error interno, intentelo más tarde.',
    });
  }

  static isOPerationalError(error) {
    if (error instanceof BaseError) return error.isOperational;

    return false;
  }
}
