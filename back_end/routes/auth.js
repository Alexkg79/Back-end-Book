const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Route pour l'inscription
router.post('/signup', authController.signup);

// Route pour la connexion
router.post('/login', authController.login);

module.exports = router;
