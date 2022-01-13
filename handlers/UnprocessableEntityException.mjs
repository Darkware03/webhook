import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';

export default class NotFoundExeption extends BaseError {
  constructor(name = 'UNPROCESSABLE_ENTITY', statusCode = HttpCode.HTTP_UNPROCESSABLE_ENTITY, description = 'Unprocessable Entity') {
    super(name, statusCode, description);
  }
}
