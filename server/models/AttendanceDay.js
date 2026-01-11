const mongoose = require('mongoose')

const attendanceDaySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  date: { type: String, required: true },

  isHoliday: { type: Boolean, default: false },

  overrideDay: {
    type: String,
    enum: ["monday","tuesday","wednesday","thursday","friday","saturday","sunday", null],
    default: null
  },

  records: [
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
      status: { type: String, enum: ["attended", "missed", "cancelled"], required: true },
      count: { type: Number, default: 1 }
    }
  ]
});

attendanceDaySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("AttendanceDay", attendanceDaySchema);