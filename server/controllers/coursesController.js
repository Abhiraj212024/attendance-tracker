const Course = require('../models/Course')
const AttendanceDay = require('../models/AttendanceDay')
const { rebuildAllDays } = require("../services/attendanceRebuilder");


const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ user: req.user })
        res.json(courses)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}

const createCourse = async (req, res) => {
    const { code, name, schedule } = req.body
    if(!code || !name || !schedule) return res.status(400).json({
        'message': "All fields are required"
    })

    try {
        const newCourse = await Course.create({
            user: req.user,
            code: code,
            name: name,
            schedule: schedule
        })

        await rebuildAllDays(req.user)

        res.status(201).json(newCourse)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}

const editCourse = async (req, res) => {
  const id = req.params.id
  const { code, name, schedule } = req.body

  if (!code && !name && !schedule) {
    return res.status(400).json({ message: 'At least one field is required' })
  }

  try {
    const foundCourse = await Course.findOne({ _id: id, user: req.user })
    if (!foundCourse) {
      return res.status(404).json({ message: 'Course not found' })
    }

    if (code) foundCourse.code = code
    if (name) foundCourse.name = name
    if (schedule) foundCourse.schedule = schedule

    // save first
    await foundCourse.save()

    // rebuild attendance from updated DB state
    if (schedule) {
      await rebuildAllDays(req.user)
    }

    res.json(foundCourse)

  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}


const deleteCourse = async (req, res) => {
    const id = req.params.id
    if(!id) return res.status(400).json({
        'message': 'Id not passed correctly'
    })

    try {
        // FIX: Remove this course from all attendance records
        await AttendanceDay.updateMany(
            { user: req.user },
            { $pull: { records: { course: id } } }
        )

        await Course.deleteOne({ _id: id, user: req.user })
        res.sendStatus(204)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}


module.exports = { getCourses, createCourse, editCourse, deleteCourse }