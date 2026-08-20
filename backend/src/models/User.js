const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], required: true },
  name: { type: String, required: true, trim: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  active: { type: Boolean, default: true },
  isMaster: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
