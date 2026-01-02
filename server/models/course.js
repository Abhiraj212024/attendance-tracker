// models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  days: [String],
  classesPerDay: Number,
  threshold: Number
});

module.exports = mongoose.model("Course", courseSchema);

