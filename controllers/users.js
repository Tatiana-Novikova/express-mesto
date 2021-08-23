const OK = 200;
const CREATED = 201;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');
const InternalServerError = require('../errors/internal-server-error');

const User = require('../models/user');

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        return next(new ForbiddenError('Пользователь уже существует'));
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
              .then((user) => res.status(CREATED).send({ user: user.toJSON() }))
              .catch((err) => {
                if (err.name === 'ValidationError') {
                  return next(new BadRequestError(`Пользователь не создан. Ошибка ${err.name}`));
                } else if (err.name === 'MongoError' && err.code === 11000) {
                  return next(new ConflictError(`Пользователь c таким адресом уже существует. Ошибка ${err.name}`));
                } else {
                  return next(new InternalServerError(`На сервере произошла ошибка ${err.name}`));
                }
              });
          });
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Такого пользователя нет. Неправильные почта или пароль'));
      } else {
        bcrypt.compare(password, user.password, ((err, isValid) => {
          if (!isValid) {
            return next(new ForbiddenError('Неправильный пароль'));
          }
          if (isValid) {
            const token = jwt.sign(
              { _id: 'd285e3dceed844f902650f40' },
              'JWT_SECRET', { expiresIn: '7d' },
            );
            res.cookie('jwt', token, {
              httpOnly: true,
              someSite: true,
            }).status(OK).send({ message: 'Успешная авторизация' });
          }
        }));
      }
    })
    .catch((err) => next(
      new UnauthorizedError(`Пользователь не авторизован. Ошибка ${err.name}`),
    ));
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK).send({ data: users }))
    .catch((err) => next(
      new InternalServerError(`На сервере произошла ошибка ${err.name}`),
    ));
};

const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(`Переданы некорректные данные. Ошибка ${err.name}`));
      } else if (err.message === 'NotValidId') {
        return next(new NotFoundError(`Запрашиваемый пользователь не найден. Ошибка ${err.name}`));
      } else {
        return next(new InternalServerError(`На сервере произошла ошибка ${err.name}`));
      }
    });
};

const updateProfile = (req, res, next) => {
  User.findByIdAndUpdate(req.params.userId, { runValidators: true, new: true })
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(`Запрашиваемый пользователь не найден. Ошибка ${err.name}`));
      } else if (err.message === 'NotValidId') {
        return next(new NotFoundError(`Переданы некорректные данные при обновлении профиля. Ошибка ${err.name}`));
      } else {
        return next(new InternalServerError(`На сервере произошла ошибка ${err.name}`));
      }
    });
};

const updateAvatar = (req, res, next) => {
  User.avatar.findByIdAndUpdate(req.params.userId, { runValidators: true, new: true })
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(`Запрашиваемый пользователь не найден. Ошибка ${err.name}`));
      } else if (err.message === 'NotValidId') {
        return next(new NotFoundError(`Переданы некорректные данные при обновлении аватара. Ошибка ${err.name}`));
      } else {
        return next(new InternalServerError(`На сервере произошла ошибка ${err.name}`));
      }
    });
};

module.exports = {
  login,
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateAvatar,
};
