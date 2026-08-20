const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  faculty: { type: Number, enum: [3, 4], required: true },
  groups: { type: [Number], default: [] },
  allowAll: { type: Boolean, default: false }
}, { timestamps: true });
schema.index({ adminId: 1, faculty: 1 }, { unique: true });
module.exports = mongoose.model('AdminPermission', schema);
