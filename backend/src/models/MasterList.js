const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  key: { type: String, enum: ['locations', 'facultyMembers', 'assistants', 'externals'], unique: true },
  items: { type: [String], default: [] }
}, { timestamps: true });
module.exports = mongoose.model('MasterList', schema);
