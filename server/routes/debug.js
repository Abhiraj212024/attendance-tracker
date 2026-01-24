const express = require('express');
const router = express.Router();


// Add this route for debugging
router.get('/debug', async (req, res) => {
  const Course = require('../models/Course');
  const courses = await Course.find({ user: req.user }).lean();
  res.json(courses);
});

module.exports = router;