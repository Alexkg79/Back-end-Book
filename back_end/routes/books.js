const express = require('express');
const multer = require('multer');
const path = require('path');
const Book = require('../models/book');
const auth = require('../middleware/auth');

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

// Route pour ajouter un livre
router.post('/books', auth, upload.single('image'), async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book);
    const {
      title, author, year, genre, averageRating, ratings,
    } = bookData;

    const coverImage = req.file ? `/uploads/${req.file.filename}` : '';

    const book = new Book({
      userId: req.userData.userId,
      title,
      author,
      publicationYear: year,
      genre,
      rating: averageRating,
      ratings,
      coverImage,
    });

    const savedBook = await book.save();
    return res.status(201).json(savedBook);
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    return res.status(500).json({ error: 'Erreur lors de la création du livre.' });
  }
});

// Route pour récupérer tous les livres
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des livres.' });
  }
});

module.exports = router;
