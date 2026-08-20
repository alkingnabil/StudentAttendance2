const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  faculty: { type: Number, required: true, index: true },
  group: Number,
  dateKey: { type: String, required: true },
  time: { type: String, required: true },
  method: { type: String, enum: ['qr', 'code', 'manual'], default: 'qr' },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
attendanceSchema.index({ studentId: 1, dateKey: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', attendanceSchema);
