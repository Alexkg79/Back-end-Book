const express = require('express');
const auth = require('../middleware/auth');
const optimizeImage = require('../middleware/optimizeImage');
const bookController = require('../controllers/bookController');
const upload = require('../middleware/upload');

const router = express.Router();

module.exports = upload;

// Route pour ajouter un livre
router.post('/books', auth, upload.single('image'), optimizeImage, bookController.addBook);

// Route pour récupérer tous les livres
router.get('/books', bookController.getAllBooks);

// Route pour ajouter une note à un livre
router.post('/books/:id/rating', auth, bookController.addBookRating);

// Route pour mettre à jour un livre
router.put('/books/:id', auth, upload.single('image'), optimizeImage, bookController.updateBook);

// Route pour supprimer un livre
router.delete('/books/:id', auth, bookController.deleteBook);

// Route pour récupérer les livres les mieux notés
router.get('/books/bestrating', bookController.getBestRatedBooks);

// Route pour récupérer un livre par son ID
router.get('/books/:id', bookController.getBookById);

module.exports = router;
