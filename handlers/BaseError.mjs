export default class BaseError extends Error {
  constructor(name, statusCode, description, isOperational = false) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.description = description;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}
