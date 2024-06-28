const express = require('express');
const router = express.Router();
const multer = require('multer');
const Book = require('../models/book');
const auth = require('../middleware/auth');

// Configuration de multer pour le téléchargement d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route pour ajouter un livre
router.post('/books', auth, upload.single('coverImage'), async (req, res) => {
  console.log('Requête reçue pour ajouter un livre:', req.body);
  if (!req.file) {
    return res.status(400).json({ error: 'Image de couverture requise' });
  }

  const {
    title, author, publicationYear, genre, rating,
  } = req.body;
  const coverImage = req.file.path;

  const book = new Book({
    title,
    author,
    publicationYear,
    genre,
    rating,
    coverImage,
  });

  try {
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
router.put('/books/:id', auth, upload.single('coverImage'), async (req, res) => {
  const {
    title, author, publicationYear, genre, rating,
  } = req.body;
  const coverImage = req.file ? req.file.path : undefined;

  const updateData = {
    title,
    author,
    publicationYear,
    genre,
    rating,
  };

  if (coverImage) {
    updateData.coverImage = coverImage;
  }

  console.log('Mise à jour des données:', updateData);

  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true, useFindAndModify: false },
    );
    if (!updatedBook) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }
    console.log('Livre mis à jour:', updatedBook);
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
