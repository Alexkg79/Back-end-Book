const fs = require('fs');
const path = require('path');
const Book = require('../models/book');

// Ajouter un livre
exports.addBook = async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book);
    const {
      title, author, year, genre, ratings,
    } = bookData;

    const imageUrl = req.file ? `http://localhost:4000/uploads/${req.file.filename}` : '';

    let averageRating = 0;
    if (ratings && ratings.length > 0) {
      const totalRating = ratings.reduce((acc, curr) => acc + curr.grade, 0);
      averageRating = totalRating / ratings.length; // Calcul de la note moyenne
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

    const savedBook = await book.save(); // Sauvegarde du livre
    return res.status(201).json(savedBook);
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    return res.status(500).json({ error: 'Erreur lors de la création du livre.' });
  }
};

// Récupérer tous les livres
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find(); // Récupère tous les livres
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des livres.' });
  }
};

// Ajouter une note à un livre
exports.addBookRating = async (req, res) => {
  try {
    const { userId, rating } = req.body;
    const bookId = req.params.id;

    const book = await Book.findById(bookId); // Trouve le livre par ID
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }

    // Vérifie si l'utilisateur a déjà noté
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
};

// Mettre à jour un livre
exports.updateBook = async (req, res) => {
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

    // Trouver le livre
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }

    const updateData = {
      title,
      author,
      year,
      genre,
      rating,
    };

    if (imageUrl) {
      // Supprimer l'ancienne image
      if (book.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', path.basename(book.imageUrl));
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error('Erreur lors de la suppression de l\'ancienne image:', err);
          } else {
            console.log('Ancienne image supprimée avec succès.');
          }
        });
      }
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
};

// Supprimer un livre
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id); // Récupère le livre avec ID
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }

    // Supprimer l'image associée
    if (book.imageUrl) {
      const imagePath = path.join(__dirname, '..', 'uploads', path.basename(book.imageUrl));
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression de l\'image:', err);
        } else {
          console.log('Image supprimée avec succès.');
        }
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Livre supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression du livre.' });
  }
};

// Récupérer les livres les mieux notés
exports.getBestRatedBooks = async (req, res) => {
  try {
    console.log('Tentative de récupération des livres les mieux notés');
    // Tri par note moyenne, limite à 3
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);

    console.log('Livres trouvés:', books);
    if (books.length === 0) {
      console.log('Aucun livre trouvé.');
      return res.status(404).json({ error: 'Aucun livre trouvé.' });
    }

    console.log('Livres récupérés:', books);
    return res.status(200).json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres les mieux notés:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des livres les mieux notés.' });
  }
};

// Récupérer un livre par son ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id); // Trouve le livre avec ID
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération du livre.' });
  }
};
