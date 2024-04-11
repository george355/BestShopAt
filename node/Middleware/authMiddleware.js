const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    const token = req.header('Authorization').split(' ')[1]; // Bearer YOUR_JWT_TOKEN

    console.log('[Backend] Verifying token...');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    console.error('Error verifying the token:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware;

