const mongoose = require('mongoose');
const studyMonthSchema = new mongoose.Schema({
  faculty: { type: Number, enum: [3, 4], required: true, index: true },
  month: { type: String, required: true },
  lectures: { type: Number, required: true, min: 0 },
  evaluationDate: { type: String, default: '' }
}, { timestamps: true });
studyMonthSchema.index({ faculty: 1, month: 1 }, { unique: true });
module.exports = mongoose.model('StudyMonth', studyMonthSchema);
