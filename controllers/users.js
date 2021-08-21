const OK = 200;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');
const InternalServerError = require('../errors/internal-server-error');

const User = require('../models/user');

const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        Promise.reject(new Error('Неправильные почта или пароль'));
      }
      res.send({ message: 'Успешная авторизация' });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: 'd285e3dceed844f902650f40' },
        'super-strong-secret', { expiresIn: '7d' },
      );
      res.send({ token });
      return bcrypt.compare(token, user.token);
    })
    .then((matched) => {
      if (!matched) {
        throw new UnauthorizedError('Пользователь не авторизован. Ошибка токена');
      }
    })
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError(`Пользователь c таким адресом уже существует. Ошибка ${err.name}`);
      } else {
        throw new UnauthorizedError(`Пользователь не авторизован. Ошибка ${err.name}`);
      }
    });
};

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(OK).send({ data: users }))
    .catch((err) => {
      throw new InternalServerError(`На сервере произошла ошибка ${err.name}`);
    });
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK).send({ data: user }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError(`Запрашиваемый пользователь не найден. Ошибка ${err.name}`);
      } else if (err.name === 'CastError') {
        throw new BadRequestError(`Переданы некорректные данные. Ошибка ${err.name}`);
      } else {
        throw new InternalServerError(`На сервере произошла ошибка ${err.name}`);
      }
    });
};

const createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password: hash,
  } = req.body;
  User.create({
    name,
    about,
    avatar,
    email,
    password: hash,
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(`Пользователь не создан. Ошибка ${err.name}`);
      } else {
        throw new InternalServerError(`На сервере произошла ошибка ${err.name}`);
      }
    });
};

const updateProfile = (req, res) => {
  User.findByIdAndUpdate(req.params.userId, { runValidators: true, new: true })
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK).send({ data: user }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError(`Переданы некорректные данные при обновлении профиля. Ошибка ${err.name}`);
      } else if (err.name === 'CastError') {
        throw new BadRequestError(`Запрашиваемый пользователь не найден. Ошибка ${err.name}`);
      } else {
        throw new InternalServerError(`На сервере произошла ошибка ${err.name}`);
      }
    });
};

const updateAvatar = (req, res) => {
  User.avatar.findByIdAndUpdate(req.params.userId, { runValidators: true, new: true })
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK).send({ data: user }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError(`Переданы некорректные данные при обновлении аватара. Ошибка ${err.name}`);
      } else if (err.name === 'CastError') {
        throw new BadRequestError(`Запрашиваемый пользователь не найден. Ошибка ${err.name}`);
      } else {
        throw new InternalServerError(`На сервере произошла ошибка ${err.name}`);
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
