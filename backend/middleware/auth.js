const jwt = require('jsonwebtoken');
module.exports = function(requiredRoles = []) {
  return (req, res, next) => {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) return res.status(401).json({ message: 'Unauthorized' });
    const token = String(auth).replace(/^Bearer\s+/i, '');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) return res.status(403).json({ message: 'Forbidden' });
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
}
