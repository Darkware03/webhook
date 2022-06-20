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
    let message = 'Ha ocurrido un error interno, intentelo más tarde.';
    const code = Handler.#getErrorCode(err);
    if (debug) {
      return res.status(code).json({ err, stack: err.stack });
    }
    if (err.name && err.name === 'JsonSchemaValidation') return res.status(HttpCode.HTTP_BAD_REQUEST).json(debug ? err : err.validations.body);

    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(HttpCode.HTTP_BAD_REQUEST).json(
        debug
          ? err
          : err.errors.map((row) => ({
            field: row.path,
            message: row.message,
          })),
      );
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json(
        debug
          ? err
          : {
            message:
                'No se puede eliminar uno o más registros debido a que tienen acciones asociadas al sistema',
          },
      );
    }

    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(HttpCode.HTTP_UNAUTHORIZED).json({
        message: 'No autenticado',
      });
    }

    if (err.statusCode) message = err.description;

    return res.status(err.statusCode || HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({
      message,
    });
  }

  static #getErrorCode(err) {
    const CodeErrors = {
      badRequest: {
        names: [
          'SequelizeValidationError',
          'JsonSchemaValidation',
          'SequelizeUniqueConstraintError',
        ],
        code: HttpCode.HTTP_BAD_REQUEST,
      },
      unauthorized: {
        names: ['TokenExpiredError', 'JsonWebTokenError'],
        code: HttpCode.HTTP_UNAUTHORIZED,
      },
      internal: {
        names: ['SequelizeForeignKeyConstraintError'],
        code: HttpCode.HTTP_INTERNAL_SERVER_ERROR,
      },
    };

    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const type in CodeErrors) {
      if (CodeErrors[type].names.includes(err.name)) return CodeErrors[type].code;
    }
    return HttpCode.HTTP_INTERNAL_SERVER_ERROR;
  }

  static isOPerationalError(error) {
    if (error instanceof BaseError) return error.isOperational;

    return false;
  }
}
