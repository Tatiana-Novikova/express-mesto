const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTRNAL_SERVER_ERROR = 500;

const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Пользователи не найдены. Ошибка ${err.name}` });
      } else {
        res
          .status(INTRNAL_SERVER_ERROR)
          .send({ message: `Ошибка сервера ${err.name}` });
      }
    });
};

const getUser = (req, res) => {
  User.findById(req.params.id)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(NOT_FOUND)
          .send({ message: `Запрашиваемый пользователь не найден. Ошибка ${err.name}` });
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
  User.findByIdAndUpdate(req.params.id, { new: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Переданы некорректные данные при обновлении профиля. Ошибка ${err}` });
      } else if (err.name === 'ValidationError') {
        res
          .status(NOT_FOUND)
          .send({ message: `Запрашиваемый пользователь не найден. Ошибка ${err}` });
      } else {
        res
          .status(INTRNAL_SERVER_ERROR)
          .send({ message: `Ошибка сервера ${err.name}` });
      }
    });
};

const updateAvatar = (req, res) => {
  User.avatar.findByIdAndUpdate(req.params.id, { new: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === '') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Переданы некорректные данные при обновлении аватара. Ошибка ${err}` });
      } else if (err.name === 'CastError') {
        res
          .status(NOT_FOUND)
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
