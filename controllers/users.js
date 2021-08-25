const OK = 200;
const CREATED = 201;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');

const User = require('../models/user');

const getUsers = (req, res, next) => {
  return User.find({})
    .then((users) => res.status(OK).send({ data: users }))
    .catch((err) => next(err));
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  return User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден');
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
        throw new NotFoundError('Пользователь с указанным _id не найден');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  return User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден');
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
        throw new NotFoundError('Пользователь с указанным _id не найден');
      } else {
        next(err);
      }
    })
    .catch(next);
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
    return next(
      new UnauthorizedError(
        'Передан неверный логин или пароль',
      ),
    );
  }
  User.findOne({ email })
    .then((user) => {
      if (user) {
        return next(
          new ConflictError(
            'Пользователь c таким адресом уже существует',
          ),
        );
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
                res.status(CREATED)
                  .send({ message: 'Успешная регистрация' });
              })
              .catch((err) => {
                if (err.name === 'ValidationError') {
                  return (
                    new BadRequestError(
                      `Переданы некорректные данные при создании пользователя. Ошибка ${err.name}`,
                    )
                  );
                }
                if (err.name === 'MongoError' && err.code === 11000) {
                  return next(
                    new ConflictError(
                      `Пользователь c таким адресом уже существует. Ошибка ${err.name}`,
                    ),
                  );
                }
              });
          });
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new UnauthorizedError(
        'Передан неверный логин или пароль',
      ),
    );
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
            return next(
              new UnauthorizedError(
                'Передан неверный логин или пароль',
              ),
            );
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
            }).status(OK).send({ message: 'Успешная авторизация' });
          }
        }));
      }
    })
    .catch((err) => next(
      new UnauthorizedError(`Пользователь не авторизован. Ошибка ${err.name}`),
    ))
    .catch(next);
};

const updateProfile = (req, res, next) => {
  return User.findByIdAndUpdate(
    req.user._id,
    { runValidators: true, new: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден');
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
      if (err.message === 'CastError') {
        return next(
          new BadRequestError(
            `Переданы некорректные данные при обновлении профиля. Ошибка ${err.name}`,
          ),
        );
      }
    })
    .catch(next);
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
        throw new NotFoundError('Пользователь с указанным _id не найден');
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
      if (err.message === 'CastError') {
        return next(
          new BadRequestError(
            `Переданы некорректные данные при обновлении аватара. Ошибка ${err.name}`,
          ),
        );
      }
    })
    .catch(next);
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
