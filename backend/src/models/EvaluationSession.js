const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  faculty: { type: Number, enum: [3, 4], required: true, index: true },
  month: { type: String, required: true },
  date: { type: String, required: true },
  max: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
schema.index({ faculty: 1, status: 1 });
module.exports = mongoose.model('EvaluationSession', schema);
