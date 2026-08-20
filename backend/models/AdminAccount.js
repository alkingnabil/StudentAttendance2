const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AdminSchema = new Schema({
  email: { type: String, unique: true, required: true },
  name: String,
  passwordHash: String,
  groups: [String],
  role: { type: String, enum: ['admin','master'], default: 'admin' }
}, { timestamps: true });
module.exports = mongoose.model('AdminAccount', AdminSchema);
