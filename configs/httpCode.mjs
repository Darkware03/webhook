export default class HttpCode {
  // Success
  static HTTP_OK = 200;

  static HTTP_CREATED = 201;

  // CLIENT ERRORS
  static HTTP_BAD_REQUEST = 400;

  static HTTP_UNAUTHORIZED = 401;

  static HTTP_FORBIDDEN = 403;

  static HTTP_NOT_FOUND = 404;

  static HTTP_UNPROCESSABLE_ENTITY = 422;

  static HTTP_NOT_MODIFIED = 304;

  // SERVER ERRORS
  static HTTP_INTERNAL_SERVER_ERROR = 500;
}
