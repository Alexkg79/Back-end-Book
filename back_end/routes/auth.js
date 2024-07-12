const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Route pour l'inscription
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur déjà existant!' });
    }

    const user = new User({ email, password });
    await user.save();

    return res.status(201).json({ message: 'Utilisateur créé!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur interne du serveur!' });
  }
});

// Route pour la connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect!' });
    }

    // Génération du token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ token, userId: user._id });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur interne du serveur!' });
  }
});

module.exports = router;
