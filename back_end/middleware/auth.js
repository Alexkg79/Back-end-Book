const jwt = require('jsonwebtoken');

// Middleware d'authentification
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.userId;
    next();
  } catch {
    res.status(401).json({
      error: new Error('Requête non authentifiée!'),
    });
  }
};
