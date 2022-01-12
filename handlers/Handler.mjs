import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';

export default class Handler {
  static logError(err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  static logErrorMiddleware(err, req, res, next) {
    Handler.logError(err);
    next(err);
  }

  static handlerError(err, req, res) {
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
