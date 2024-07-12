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

// Route pour récupérer un livre par son ID
router.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération du livre.' });
  }
});

// Route pour mettre à jour un livre
router.put('/books/:id', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    console.log('Image reçue:', req.file);

    if (!req.body.book) {
      return res.status(400).json({ error: 'Les données du livre sont manquantes.' });
    }

    const bookData = JSON.parse(req.body.book);
    const {
      title, author, year, genre, rating,
    } = bookData;

    const coverImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData = {
      title,
      author,
      publicationYear: year,
      genre,
      rating,
    };

    if (coverImage) {
      updateData.coverImage = coverImage;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );
    if (!updatedBook) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }
    return res.status(200).json(updatedBook);
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du livre.' });
  }
});

// Route pour supprimer un livre
router.delete('/books/:id', auth, async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }
    return res.status(200).json({ message: 'Livre supprimé avec succès.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la suppression du livre.' });
  }
});

module.exports = router;
