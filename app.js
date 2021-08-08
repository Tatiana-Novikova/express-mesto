const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');

const { PORT = 3000 } = process.env;
const app = express();

app.use((req, res, next) => {
  req.user = {
    _id: '610c4ffef95f2e135d3dbe61',
  };

  next();
});

const rootRouter = require('./routes');

app.use(express.json());
app.use(helmet());
app.disable('x-powered-by');
app.use('/', rootRouter);

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
