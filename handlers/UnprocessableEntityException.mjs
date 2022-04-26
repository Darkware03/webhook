import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';

export default class UnprocessableEntityException extends BaseError {
  constructor(description = 'Unprocessable Entity') {
    super('UNPROCESSABLE_ENTITY', HttpCode.HTTP_UNPROCESSABLE_ENTITY, description);
  }
}
