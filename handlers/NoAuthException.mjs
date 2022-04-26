import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';

export default class NoAuthException extends BaseError {
  constructor(description = 'No autenticado') {
    super('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, description);
  }
}
