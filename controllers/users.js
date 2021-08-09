const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTRNAL_SERVER_ERROR = 500;

const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => {
      res
        .status(INTRNAL_SERVER_ERROR)
        .send({ message: `Ошибка сервера ${err.name}` });
    });
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(NOT_FOUND)
          .send({ message: `Запрашиваемый пользователь не найден. Ошибка ${err.name}` });
      } else if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Переданы некорректные данные. Ошибка ${err.name}` });
      } else {
        res
          .status(INTRNAL_SERVER_ERROR)
          .send({ message: `Ошибка сервера ${err.name}` });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Пользователь не создан. Ошибка ${err.name}` });
      } else {
        res
          .status(INTRNAL_SERVER_ERROR)
          .send({ message: `Ошибка сервера ${err.name}` });
      }
    });
};

const updateProfile = (req, res) => {
  User.findByIdAndUpdate(req.params.userId, { runValidators: true, new: true })
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(NOT_FOUND)
          .send({ message: `Переданы некорректные данные при обновлении профиля. Ошибка ${err}` });
      } else if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Запрашиваемый пользователь не найден. Ошибка ${err}` });
      } else {
        res
          .status(INTRNAL_SERVER_ERROR)
          .send({ message: `Ошибка сервера ${err.name}` });
      }
    });
};

const updateAvatar = (req, res) => {
  User.avatar.findByIdAndUpdate(req.params.userId, { runValidators: true, new: true })
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(NOT_FOUND)
          .send({ message: `Переданы некорректные данные при обновлении аватара. Ошибка ${err}` });
      } else if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Запрашиваемый пользователь не найден. Ошибка ${err}` });
      } else {
        res
          .status(INTRNAL_SERVER_ERROR)
          .send({ message: `Ошибка сервера ${err.name}` });
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateAvatar,
};
