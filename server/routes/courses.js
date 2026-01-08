const express = require('express')
const router = express.Router()
const coursesController = require('../controllers/coursesController')

router.get('/', coursesController.getCourses)
router.post('/', coursesController.createCourse)
router.delete('/:id', coursesController.deleteCourse)
router.put('/:id', coursesController.editCourse)

module.exports = router