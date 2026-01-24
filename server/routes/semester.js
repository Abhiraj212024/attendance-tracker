const express = require('express')
const router = express.Router()
const semesterController = require('../controllers/semesterController')

router.get("/", semesterController.getSemesterDates)
router.post("/", semesterController.setSemesterDates)

module.exports = router