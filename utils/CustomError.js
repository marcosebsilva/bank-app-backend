class CustomError extends Error {
  constructor(message, status) {
    super();
    this.name = 'CustomError';
    this.status = status;
    this.message = message;
  }
}

module.exports = CustomError;
