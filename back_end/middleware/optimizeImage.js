const sharp = require('sharp');
const path = require('path');

const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Chemin de l'image optimisée
    const optimizedImagePath = path.join('uploads', `optimized-${Date.now()}-${req.file.originalname}`);

    // Optimisation de l'image avec Sharp
    await sharp(req.file.buffer)
      .resize(800, 800, { fit: sharp.fit.inside })
      .toFormat('webp')
      .webp({ quality: 80 })
      .toFile(optimizedImagePath);

    // Ajout de l'URL de l'image optimisée
    req.file.optimizedImageUrl = `http://localhost:4000/${optimizedImagePath.replace(/\\/g, '/')}`;

    next();
  } catch (error) {
    console.error('Erreur lors de l\'optimisation de l\'image:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'optimisation de l\'image.' });
  }
  return null;
};

module.exports = optimizeImage;
