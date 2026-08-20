const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  faculty: { type: Number, enum: [3, 4], required: true, index: true },
  name: { type: String, required: true, trim: true },
  nationalId: { type: String, trim: true, index: true, sparse: true },
  phone: { type: String, trim: true },
  seatNumber: { type: String, trim: true },
  group: { type: Number, min: 1, max: 30, default: null, index: true },
  code: { type: String, required: true, trim: true, index: true },
  qrToken: { type: String, required: true, unique: true, index: true },
  training: String,
  facultyMember: String,
  assistant: String,
  external: String,
  registered: { type: Boolean, default: false },
  demo: { type: Boolean, default: false }
}, { timestamps: true });

studentSchema.index({ faculty: 1, code: 1 }, { unique: true });
studentSchema.index({ nationalId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Student', studentSchema);
