const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

dotenv.config({ path: './back_end/.env' });

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error));

app.use('/api/auth', authRoutes);

app.get('/api/protected-route', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Accès autorisé!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
