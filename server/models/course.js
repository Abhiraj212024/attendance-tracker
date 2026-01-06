// models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  code: {
    type: String,
    required: true,
    trim: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  schedule: {
    monday: { type: Number, default: 0, min: 0 },
    tuesday: { type: Number, default: 0, min: 0 },
    wednesday: { type: Number, default: 0, min: 0 },
    thursday: { type: Number, default: 0, min: 0 },
    friday: { type: Number, default: 0, min: 0 },
    saturday: { type: Number, default: 0, min: 0 },
    sunday: { type: Number, default: 0, min: 0 }
  }

}, { timestamps: true });


module.exports = mongoose.model("Course", courseSchema);

