const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  nationalId: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student'], default: 'student' }
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);
