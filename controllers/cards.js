const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTRNAL_SERVER_ERROR = 500;

const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Карточки не найдены. Ошибка ${err.name}` });
      } else {
        res
          .status(INTRNAL_SERVER_ERROR)
          .send({ message: `Ошибка сервера ${err.name}` });
      }
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link })
    .then((card) => res.send({ data: card }))
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
  Card.findById(req.params.id)
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(NOT_FOUND)
          .send({ message: `Карточка не удалена. Ошибка ${err.name}` });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Ошибка ${err.name}` });
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
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(BAD_REQUEST)
          .send({ message: `Ошибка ${err.name}` });
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
