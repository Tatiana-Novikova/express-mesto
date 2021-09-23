const OK = 200;
const CREATED = 201;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');

const User = require('../models/user');
const errorHandler = require('../middlewares/error-handler');

const getUsers = (req, res) => {
  return User.find({})
    .then((users) => res.status(OK).send({ users }))
    .catch(errorHandler);
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь с указанным id не найден'));
      }
      res.status(OK).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
        cohort: user.cohort,
      });
    })
    .catch(errorHandler);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь с указанным id не найден'));
      }
      res.status(OK).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
        cohort: user.cohort,
      });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('С данным id пользователь не найден'));
      } else {
        next(err);
      }
    })
    .catch(errorHandler);
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  if (!email || !password) {
    return next(new UnauthorizedError('Передан неверный логин или пароль'));
  }
  User.findOne({ email })
    .then((user) => {
      if (user) {
        return next(new ConflictError('Пользователь c таким адресом уже существует'));
      } else {
        bcrypt.hash(password, 10)
          .then((hash) => {
            User.create({
              name,
              about,
              avatar,
              email,
              password: hash,
            })
              .then((user) => {
                res.status(CREATED).send({
                  data: {
                    id: user._id,
                    email: user.email,
                  },
                });
              })
              .catch(errorHandler);
          });
      }
    })
    .catch(errorHandler);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new UnauthorizedError('Передан неверный логин или пароль'));
  }
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(
          new UnauthorizedError(
            'Передан неверный логин или пароль',
          ),
        );
      } else {
        bcrypt.compare(password, user.password, ((err, isValid) => {
          if (err || !isValid) {
            return next(new UnauthorizedError('Передан неверный логин или пароль'));
          }
          if (isValid) {
            const token = jwt.sign(
              { _id: user._id },
              'JWT_SECRET',
              { expiresIn: '7d' },
            );
            res.cookie('jwt', token, {
              httpOnly: true,
              sameSite: true,
            }).status(OK).send({ token: `${token}` });
          }
        }));
      }
    })
    .catch(errorHandler);
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(
    userId,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь с указанным _id не найден'));
      }
      res.status(OK).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
        cohort: user.cohort,
      });
    })
    .catch(errorHandler);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { runValidators: true, new: true },
  )
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь с указанным _id не найден'));
      }
      res.status(OK).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
        cohort: user.cohort,
      });
    })
    .catch(errorHandler);
};

module.exports = {
  login,
  getUsers,
  getCurrentUser,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
