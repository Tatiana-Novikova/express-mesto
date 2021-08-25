const { celebrate, Joi } = require('celebrate');
const isEmail = require('validator/lib/isEmail');
const router = require('express').Router();
const auth = require('../middlewares/auth');

const {
  login,
  getUsers,
  getCurrentUser,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).default('Жак-Ив Кусто'),
    about: Joi.string().default('Исследователь'),
    avatar: Joi.string().default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png'),
    email: Joi.string().required().custom(
      (value) => {
        if (isEmail(value)) {
          return value;
        }
      },
      'Неправильный формат почты',
    ),
    password: Joi.string().required(),
  }),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom(
      (value) => {
        if (isEmail(value)) {
          return value;
        }
      },
      'Неправильный формат почты',
    ),
    password: Joi.string().required(),
  }),
}), login);

router.use(auth);

router.get('/', auth, getUsers);

router.get('/me', celebrate({
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
}), auth, getCurrentUser);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
}), auth, getUserById);

router.patch('/me', celebrate({
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
}), auth, updateProfile);

router.patch('/me/avatar', celebrate({
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
}), auth, updateAvatar);

module.exports = router;
