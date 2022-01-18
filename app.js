const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sequelize = require('./models/index').sequelize;

const indexRouter = require('./routes/index');
const booksRouter = require('./routes/books');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', booksRouter);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  try {
    await sequelize.sync();
    console.log('database synced');
  } catch (error) {
    console.log('Unable to sync the database', error);
  }
})();

// custom 404 error handler
app.use((req, res, next) => {
  console.log('404 error handler called');
  const err = new Error('It looks like the page you\'re looking for does not exist.');
  err.status = 404;
  next(err);
});

// global error handler
app.use((err, req, res, next) => {
  if (err) {
    console.log('Global error handler called', err);
  }
  if (err.status === 404) {
    console.log('404 error handler called');
    res.status(404).render('books/page-not-found', { err });
  } else {
    err.message = err.message || `It looks like something went wrong on the server.`;
    res.status(err.status || 500).render('error', { err });
  }
});

module.exports = app;
