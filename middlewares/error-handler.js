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
    return next(new BadRequestError('BadRequestError'));
  }
  if (err.message === 'Not Authorized') {
    return next(new UnauthorizedError('UnauthorizedError'));
  }
  if (err.message === 'Forbidden') {
    return next(new ForbiddenError('ForbiddenError'));
  }
  if (err.message === 'Not found') {
    return next(new NotFoundError('NotFoundError'));
  }
};

module.exports = errorHandler;
