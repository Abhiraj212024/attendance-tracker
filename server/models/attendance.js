// models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  courseId: mongoose.Schema.Types.ObjectId,
  scheduled: Number,
  attended: Number
});

module.exports = mongoose.model("Attendance", attendanceSchema);

