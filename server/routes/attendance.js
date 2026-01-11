const express = require('express')
const router = express.Router()
const attendanceController = require('../controllers/attendanceController')

router.get('/', attendanceController.getAttendanceRange)
router.get('/:date', attendanceController.getAttendanceDate)
router.post('/', attendanceController.postAttendance)
router.put('/:date', attendanceController.putAttendanceDate)

module.exports = router