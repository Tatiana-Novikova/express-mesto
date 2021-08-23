const OK = 200;

const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const InternalServerError = require('../errors/internal-server-error');

const Card = require('../models/card');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(OK).send({ data: cards }))
    .catch((err) => next(
      new InternalServerError('На сервере произошла ошибка'),
    ));
};

const createCard = (req, res, next) => {
  const { name, link, owner = req.user._id } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(OK).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(`Карточка не создана. Ошибка ${err.name}`));
      } else {
        return next(new InternalServerError(`На сервере произошла ошибка ${err.name}`));
      }
    });
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new Error('NotValidId'))
    .then((card) => {
      if (card.owner._id === req.user._id) {
        res.status(OK).send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(`Переданы некорректные данные. Ошибка ${err.name}`));
      } else if (err.message === 'NotValidId') {
        return next(new NotFoundError(`Карточка не удалена. Ошибка ${err.name}`));
      }
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotValidId'))
    .then((card) => res.status(OK).send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(`Переданы некорректные данные. Ошибка ${err.name}`));
      } else if (err.message === 'NotValidId') {
        return next(new NotFoundError(`Карточка не найдена. Ошибка ${err.name}`));
      } else {
        return next(new InternalServerError(`На сервере произошла ошибка ${err.name}`));
      }
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotValidId'))
    .then((card) => res.status(OK).send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(`Переданы некорректные данные. Ошибка ${err.name}`));
      } else if (err.message === 'NotValidId') {
        return next(new NotFoundError(`Карточка не найдена. Ошибка ${err.name}`));
      } else {
        return next(new InternalServerError(`На сервере произошла ошибка ${err.name}`));
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
