const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AttendanceSchema = new Schema({
  faculty: String,
  nationalId: String,
  code: String,
  date: String,
  time: String,
  key: { type: String, index: true, unique: true }
}, { timestamps: true });
module.exports = mongoose.model('Attendance', AttendanceSchema);
