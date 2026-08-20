const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { User } = require('../models');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'غير مسجل الدخول' });
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user || !user.active) return res.status(401).json({ message: 'الحساب غير صالح' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'جلسة الدخول منتهية أو غير صالحة' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'غير مصرح' });
    next();
  };
}

module.exports = { requireAuth, requireRole };
