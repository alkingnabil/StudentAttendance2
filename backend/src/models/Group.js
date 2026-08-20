const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({
  faculty: { type: Number, enum: [3, 4], required: true },
  group: { type: Number, min: 1, max: 30, required: true },
  location: String,
  facultyMember: String,
  assistant: String,
  external: String
}, { timestamps: true });
groupSchema.index({ faculty: 1, group: 1 }, { unique: true });
module.exports = mongoose.model('Group', groupSchema);
