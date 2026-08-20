const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDatabase() {
  if (!mongoUri) throw new Error('MONGODB_URI is missing');
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  return mongoose.connection;
}

module.exports = { connectDatabase };
