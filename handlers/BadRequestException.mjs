import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';

export default class BadRequestException extends BaseError {
  constructor(
    description = 'Valores no válidos',
  ) {
    super('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, description);
  }
}
