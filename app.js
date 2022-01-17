const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sequelize = require('./models/index').sequelize;

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
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
app.use('/users', usersRouter);
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

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// custom 404 error handler
app.use((req, res) => {
  const error = new Error("The page you're looking for doesn't exist!");
  error.status = 404;
  res.status(404).render("books/not-found", { error })
  
});

// global error handler
app.use((err,req, res, next) => {
  if (err.status === 404) {
    res.render("books/not-found", { error });
  } else {
    console.log('500 global error handler called');
    err.message = err.message || 'Something went wrong with the server';
    res.locals.error = err;
    res.status(err.status || 500).render('error', { err });
  }
  
});

module.exports = app;
