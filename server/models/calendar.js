// models/CalendarDay.js
const mongoose = require("mongoose");

const calendarDaySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  type: { type: String, enum: ["instructional", "holiday"] }
});

module.exports = mongoose.model("CalendarDay",calendarDaySchema);

