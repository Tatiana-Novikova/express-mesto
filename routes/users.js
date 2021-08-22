const { celebrate, Joi } = require('celebrate');
const isEmail = require('validator/lib/isEmail');
const router = require('express').Router();
const auth = require('../middlewares/auth');

const {
  login,
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');
const user = require('../models/user');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required().custom(
      isEmail,
      'Неправильный формат почты',
    ),
  }),
}), login);

router.get('/', auth, getUsers);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
}), auth, getUser);
router.get('/me', auth, getUser);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).default('Жак-Ив Кусто'),
    about: Joi.string().default('Исследователь'),
    avatar: Joi.string().default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png'),
    email: Joi.string().required(),
    password: Joi.string().required().custom(
      isEmail,
      'Неправильный формат почты',
    ),
  }),
}), createUser);

router.patch('/me', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
}), auth, updateProfile);

router.patch('/me/avatar', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
}), auth, updateAvatar);

module.exports = router;
