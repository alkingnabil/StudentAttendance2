const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const StudentSchema = new Schema({
  faculty: { type: String, required: true },
  nationalId: { type: String, index: true, unique: true, sparse: true },
  name: String,
  phone: String,
  seat: String,
  group: String,
  code: String,
  training: String,
  facultyMember: String,
  assistant: String,
  external: String,
  registered: { type: Boolean, default: false },
  demo: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Student', StudentSchema);
