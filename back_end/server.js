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
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => {
    console.log('Connexion à MongoDB échouée !', error);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api', bookRoutes);

app.get('/api/protected-route', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Accès autorisé!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
