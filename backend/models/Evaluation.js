const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EvaluationSchema = new Schema({
  faculty: String,
  nationalId: String,
  code: String,
  date: String,
  month: String,
  score: Number,
  max: Number
}, { timestamps: true });
module.exports = mongoose.model('Evaluation', EvaluationSchema);
