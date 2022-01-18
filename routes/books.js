const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

const Sequelize = require('sequelize');
const { Op } = Sequelize.Op;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET Books listing. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll({ 
    order: [["createdAt", "DESC"]]
   });
  res.render("books/index", { books, title: "Books" });
  // try {
  //   const currentPage = req.query.page && Number(req.query.page) > 0
  //     ? Number(req.query.page)
  //     : 0;
  //   const offset = currentPage * 10
  //   const previousPage = currentPage - 1 >= 0
  //     ? currentPage - 1
  //     : 0;
  //   const nextPage = currentPage + 1;
  //   const { count, rows } = await Book.findAndCountAll(
  //     {
  //       order: [["createdAt", "DESC"]],
  //       offset: offset,
  //       limit: 10
  //     }
  //   );
  //   const totalPages = count / 10;
  //   const page = { previousPage, currentPage, nextPage, totalPages };

  //   res.render("books/index", { books: rows, title: "Books", page })
  // } catch(error) {
  //     throw error;
  // }
}));

/* GET new book form. */
router.get('/new', (req, res) => {
  res.render("books/new-book", { book: {}, title: "New Book" });
});

/* POST new book. */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books/" + book.id);
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("books/new-book", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }  
  }
}));

/* GET individual book. */
router.get("/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("books/update-book", { book, title: book.title }); 
  } else {
    const err = new Error('This book does not exist.');
    err.status = 404;
    next(err);
  }
}));

/* Update a specific book. */
router.post('/:id', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books/" + book.id); 
    } else {
      const err = new Error('This book does not exist.');
      err.status = 404;
      next(err);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct article gets updated
      res.render("books/update-book", { book, errors: error.errors, title: "Update Book" })
    } else {
      throw error;
    }
  }
}));

/* Delete individual article. */
router.post('/:id/delete', asyncHandler(async (req ,res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    const err = new Error('This book does not exist.');
    err.status = 404;
    next(err);
  }
}));

/* Error Handler */
router.get('/error', (req, res, next) => {
  const err = new Error();
  err.message = 'Server Error';
  err.status = 500;
  throw err;
})

module.exports = router;