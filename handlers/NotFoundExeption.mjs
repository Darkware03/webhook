import BaseError from './BaseError.mjs';
import HttpCode from '../configs/httpCode.mjs';

export default class NotFoundExeption extends BaseError {
  constructor(description = 'Recurso no encontrado') {
    super('NOT_FOUND', HttpCode.HTTP_NOT_FOUND, description);
  }
}
