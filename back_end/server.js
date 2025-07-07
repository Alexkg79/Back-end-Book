const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const authMiddleware = require('./middleware/auth');

dotenv.config({ path: './.env' });

console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();

app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',      // Pour le développement local
  process.env.FRONTEND_URL       // Pour le site en production sur Render
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La politique CORS pour ce site n\'autorise pas l\'accès depuis cette origine.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Connexion à la base de données MongoDB ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => {
    console.error('Connexion à MongoDB échouée !', error);
    process.exit(1);
  });

// --- Définition des routes de l'API ---
app.use('/api/auth', authRoutes);
app.use('/api/', bookRoutes);

// Exemple de route protégée par authentification
app.get('/api/protected-route', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Accès autorisé !' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});