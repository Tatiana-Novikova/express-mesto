const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');

const errorHandler = (err, req, res, next) => {
  if (
    err.name === 'ValidationError'
    || err.name === 'CastError'
    || err.message === 'Validation failed'
  ) {
    throw new BadRequestError(err.message);
  }
  if (err.message === 'Not Authorized') {
    throw new UnauthorizedError(err.message);
  }
  if (err.message === 'Forbidden') {
    throw new ForbiddenError(err.message);
  }
  if (err.message === 'Not found') {
    throw new NotFoundError(err.message);
  }
};

module.exports = errorHandler;
