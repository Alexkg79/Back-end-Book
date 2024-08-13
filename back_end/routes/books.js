const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const bookController = require('../controllers/bookController');

const router = express.Router();

// Configuration de multer pour le téléchargement d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes utilisant les contrôleurs
router.post('/books', auth, upload.single('image'), bookController.addBook);
router.get('/books', bookController.getAllBooks);
router.post('/books/:id/rating', auth, bookController.addBookRating);
router.put('/books/:id', auth, upload.single('image'), bookController.updateBook);
router.delete('/books/:id', auth, bookController.deleteBook);
router.get('/books/bestrating', bookController.getBestRatedBooks);
router.get('/books/:id', bookController.getBookById);

module.exports = router;
