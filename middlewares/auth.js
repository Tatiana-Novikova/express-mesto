const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized');

// const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  if (!req.cookies.jwt) {
    throw new UnauthorizedError('Необходима авторизация');
  } else {
    const token = req.cookies.jwt;
    let payload;
    try {
      payload = jwt.verify(token, 'JWT_SECRET');
    } catch (err) {
      throw new UnauthorizedError('Необходима авторизация');
    }
    req.user = payload;
    next();
  }
};

module.exports = auth;
