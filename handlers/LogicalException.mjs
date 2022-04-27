export default class LogicalException extends Error {
  constructor(name, message) {
    super(message);
    this.name = name;
    this.description = message;
  }
}
