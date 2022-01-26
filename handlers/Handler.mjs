import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';
import ErrorModel from '../app/nucleo/mongo/error.mjs';

export default class Handler {
  static logError(req, err) {
    console.log(err);
    // eslint-disable-next-line no-console
    if (req.usuario) {
      const Error = new ErrorModel({
        id_bitacora: req.bitacora.id,
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
    console.log(err);
    const debug = process.env.APP_DEBUG === 'true';

    if (err.name && err.name === 'JsonSchemaValidation') return res.status(HttpCode.HTTP_BAD_REQUEST).json(err.validations.body);

    if (debug) return res.status(err.statusCode || HttpCode.HTTP_INTERNAL_SERVER_ERROR).json(err);

    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(HttpCode.HTTP_BAD_REQUEST).json(err.errors.map((row) => ({
        field: row.path,
        message: row.message,
      })));
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
