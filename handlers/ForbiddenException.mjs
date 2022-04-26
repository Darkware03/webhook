import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';

export default class ForbiddenException extends BaseError {
  constructor(
    description = 'Accion denegada',
  ) {
    super('FORBIDDEN', HttpCode.HTTP_FORBIDDEN, description);
  }
}
