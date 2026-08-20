const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MonthSchema = new Schema({
  faculty: String,
  month: String,
  lectures: Number,
  evaluationDate: String
}, { timestamps: true });
module.exports = mongoose.model('Month', MonthSchema);
