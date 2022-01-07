import BaseError from "./BaseError.mjs";
import HttpCode from "../configs/httpCode.mjs";

export default class NotFoundExeption extends BaseError {
    constructor(name='BAD_REQUEST', statusCode = HttpCode.HTTP_BAD_REQUEST, description = 'Valores no válidos') {
        super(name, statusCode, description);
    }
}