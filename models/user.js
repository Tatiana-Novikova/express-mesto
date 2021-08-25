const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const isURL = require('validator/lib/isURL');

const validAvatar = /https?:\/\/(www\.)?[a-zA-Zа-яА-Я0-9._~:/?#[\]@!$&’()*+,;=\\-]+#?/g;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v) => {
        validAvatar.test(v);
        const isValid = isURL(v);
        return isValid;
      },
      message: 'Неправильный формат ссылки',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => {
        const isValid = isEmail(v);
        return isValid;
      },
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  cohort: {
    type: String,
    default: 'Здесь будет номер когорты',
  },
});

module.exports = mongoose.model('user', userSchema);
