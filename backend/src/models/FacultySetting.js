const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  faculty: { type: Number, enum: [3, 4], unique: true, required: true },
  lectureGrade: { type: Number, default: 2 },
  approved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null }
}, { timestamps: true });
module.exports = mongoose.model('FacultySetting', schema);
