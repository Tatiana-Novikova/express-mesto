const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTRNAL_SERVER_ERROR = 500;

const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((err) => {
      res
        .status(INTRNAL_SERVER_ERROR)
        .send({ message: `Ошибка сервера ${err.name}` });
    });
};

const createCard = (req, res) => {
  const { name, link, owner = req.user._id } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Карточка не создана. Ошибка ${err.name}` });
      } else {
        res
          .status(INTRNAL_SERVER_ERROR)
          .send({ message: `Ошибка сервера ${err.name}` });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    .orFail(new Error('NotValidId'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(NOT_FOUND)
          .send({ message: `Карточка не удалена. Ошибка ${err.name}` });
      } else if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Переданы некорректные данные. Ошибка ${err.name}` });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotValidId'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(NOT_FOUND)
          .send({ message: `Карточка не найдена. Ошибка ${err.name}` });
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

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotValidId'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(NOT_FOUND)
          .send({ message: `Карточка не найдена. Ошибка ${err.name}` });
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

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
