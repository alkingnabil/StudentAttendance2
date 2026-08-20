const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  faculty: { type: Number, required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  code: { type: String, required: true },
  month: { type: String, required: true },
  date: { type: String, required: true },
  score: { type: Number, required: true, min: 0 },
  max: { type: Number, required: true, min: 1 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
schema.index({ faculty: 1, studentId: 1, month: 1 }, { unique: true });
module.exports = mongoose.model('Evaluation', schema);
