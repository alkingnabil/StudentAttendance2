const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MasterListsSchema = new Schema({
  locations: [String],
  facultyMembers: [String],
  assistants: [String],
  externals: [String]
}, { timestamps: true });
module.exports = mongoose.model('MasterLists', MasterListsSchema);
