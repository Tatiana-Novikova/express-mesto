const OK = 200;

const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const InternalServerError = require('../errors/internal-server-error');

const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(OK).send({ data: cards }))
    .catch((err) => {
      throw new InternalServerError('На сервере произошла ошибка');
    });
};

const createCard = (req, res) => {
  const { name, link, owner = req.user._id } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(OK).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(`Карточка не создана. Ошибка ${err.name}`);
      } else {
        throw new InternalServerError(`На сервере произошла ошибка ${err.name}`);
      }
    });
};

const deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    .orFail(new Error('NotValidId'))
    .then((card) => {
      if (card.owner._id === req.user._id) {
        res.status(OK).send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError(`Переданы некорректные данные. Ошибка ${err.name}`);
      } else if (err.message === 'NotValidId') {
        throw new NotFoundError(`Карточка не удалена. Ошибка ${err.name}`);
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
    .then((card) => res.status(OK).send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError(`Переданы некорректные данные. Ошибка ${err.name}`);
      } else if (err.message === 'NotValidId') {
        throw new NotFoundError(`Карточка не найдена. Ошибка ${err.name}`);
      } else {
        throw new InternalServerError(`На сервере произошла ошибка ${err.name}`);
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
    .then((card) => res.status(OK).send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError(`Переданы некорректные данные. Ошибка ${err.name}`);
      } else if (err.message === 'NotValidId') {
        throw new NotFoundError(`Карточка не найдена. Ошибка ${err.name}`);
      } else {
        throw new InternalServerError(`На сервере произошла ошибка ${err.name}`);
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
