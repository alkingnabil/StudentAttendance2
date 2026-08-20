require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT || 10000),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  frontendOrigin: process.env.FRONTEND_ORIGIN || '*',
  seedDemo: String(process.env.SEED_DEMO || 'true').toLowerCase() === 'true'
};
