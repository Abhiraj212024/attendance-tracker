const express = require('express')
const router = express.Router()
const attendanceController = require('../controllers/attendanceController')

router.get('/dashboard', attendanceController.getDashboardMetrics)

router.get('/', attendanceController.getAttendanceRange)
router.post('/:date/rebuild', attendanceController.rebuildAttendanceDay)
router.get('/:date', attendanceController.getAttendanceDate)
router.put('/:date', attendanceController.putAttendanceDate)
router.post('/', attendanceController.postAttendance)

module.exports = router