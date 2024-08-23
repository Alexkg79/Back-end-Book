const multer = require('multer');

// Configuration de multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
