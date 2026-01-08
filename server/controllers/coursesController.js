const Course = require('../models/Course')

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

        res.status(201).json(newCourse)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}

const editCourse = async (req, res) => {
    const id = req.params.id
    const {code, name, schedule} = req.body
    if(!code && !name && !schedule) return res.status(400).json({
        'message': 'At least one field is required'
    })

    try {
        foundCourse = await Course.findOne({ _id : id, user: req.user })
        if(!foundCourse) return res.status(404).json({
            'message': 'Course not found'
        })

        if(code) {
            foundCourse.code = code
        }
        if(name) {
            foundCourse.name = name
        }
        if(schedule) {
            foundCourse.schedule = schedule
        }

        await foundCourse.save()

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
        await Course.deleteOne({ _id: id })
        res.sendStatus(204)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }

}

module.exports = { getCourses, createCourse, editCourse, deleteCourse }