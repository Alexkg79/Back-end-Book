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
      title, author, year, genre, ratings,
    } = bookData;

    const imageUrl = req.file ? `http://localhost:4000/uploads/${req.file.filename}` : '';

    let averageRating = 0;
    if (ratings && ratings.length > 0) {
      const totalRating = ratings.reduce((acc, curr) => acc + curr.grade, 0);
      averageRating = totalRating / ratings.length;
    }

    const book = new Book({
      userId: req.userData.userId,
      title,
      author,
      year,
      genre,
      rating: averageRating,
      ratings,
      imageUrl,
      averageRating,
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

// Route pour ajouter une note à un livre
router.post('/books/:id/rating', auth, async (req, res) => {
  try {
    const { userId, rating } = req.body;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }

    const existingRating = book.ratings.find((r) => r.userId.toString() === userId);
    if (existingRating) {
      return res.status(400).json({ error: 'Vous avez déjà noté ce livre.' });
    }

    const newRating = { userId, grade: rating };
    book.ratings.push(newRating);
    const totalRating = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
    book.averageRating = totalRating / book.ratings.length;

    await book.save();
    return res.status(200).json(book);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la notation:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'ajout de la notation.' });
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

    const imageUrl = req.file ? `http://localhost:4000/uploads/${req.file.filename}` : undefined;

    const updateData = {
      title,
      author,
      year,
      genre,
      rating,
    };

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
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
