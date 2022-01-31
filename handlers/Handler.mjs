import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';
import ErrorModel from '../app/nucleo/mongo/error.mjs';

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

    if (err.name && err.name === 'JsonSchemaValidation') return res.status(HttpCode.HTTP_BAD_REQUEST).json(err.validations.body);

    if (debug) return res.status(err.statusCode || HttpCode.HTTP_INTERNAL_SERVER_ERROR).json(err);

    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(HttpCode.HTTP_BAD_REQUEST).json(err.errors.map((row) => ({
        field: row.path,
        message: row.message,
      })));
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({ message: 'No se puede eliminar uno o más registros debido a que tienen acciones asociadas al sistema' });
    }
    return res.status(err.statusCode || HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({
      message: err.message,
    });
  }

  static isOPerationalError(error) {
    if (error instanceof BaseError) return error.isOperational;

    return false;
  }
}
