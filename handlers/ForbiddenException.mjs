import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';

export default class ForbiddenException extends BaseError {
  constructor(
    name = 'FORBIDDEN',
    statusCode = HttpCode.HTTP_FORBIDDEN,
    description = 'Accion denegada'
  ) {
    super(name, statusCode, description);
  }
}
