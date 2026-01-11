const { getDay } = require('date-fns')
const AttendanceDay = require('../models/AttendanceDay')
const Course = require('../models/Course')


const getWeekday = (day_idx) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[day_idx]
}

const getAttendanceDate = async (req, res) => {
    /**
     * Input: request and response
     * Output: Attendance Day object
     * 
     * Based on the date requested in the request and response of the get method,
     * returns the attendance day corresponding to the date given if it exists
     * Otherwise, creates a new object corresponding to that date
     */
    
    const date = req.params.date

    if(!date) return res.status(400).json({
        'message': 'This method must have a valid date entry'
    })

    const d = new Date(date)
    if(isNaN(d)) return res.status(400).json({
        'message': 'Invlaid date entry'
    })

    const normalizedDate = d.toISOString().split("T")[0]

    try {
        const foundDay = await AttendanceDay.findOne({user: req.user, 'date': normalizedDate})
        if(foundDay){
            return res.json(foundDay)
        }

        //build default daty

        const courses = await Course.find({user: req.user})
        const appliedDay = getWeekday(getDay(normalizedDate))
        const records = courses.filter(course => course.schedule[appliedDay] > 0).map(course => ({
            course: course._id,
            name: course.name,
            code: course.code,
            status: 'attended',
            count: course.schedule[appliedDay]
        }))

        res.json({
            user: req.user,
            date: normalizedDate,
            isHoliday: false,
            overrideDay: null,
            records: records
        })


    } catch (error) {
        console.log(error)
        res.sendStatus(500) //internal server error
    }
    
}

const postAttendance = async (req, res) => {
    const { date, isHoliday, overrideDay, records } = req.body


    if(!date || !records) return res.status(400).json({
        'message': 'Date and Records are required'
    })
    const d = new Date(date)

    if(isNaN(d)) return res.status(400).json({
        'message': 'Incorrect date format'
    })

    if(!Array.isArray(records)) return res.status(400).json({
        'message': 'error: expected a records array'
    })

    const normalizedDate = d.toISOString().split("T")[0]

    try{

        const existing = await AttendanceDay.findOne({user : req.user, date: normalizedDate})
        if(existing) return res.status(409).json({
            'message': 'Attendance already exists for this date'
        })

        const userCourses = await Course.find({ user: req.user })
        const validCourseIds = new Set(
            userCourses.map(course => course._id.toString())
        )

        for(const record of records) {
            const { course, status, count } = record

            if(!validCourseIds.has(course)) {
                return res.status(400).json({
                    'message': "Invalid course in records"
                })
            }

            if(!["attended", "missed", "cancelled"].includes(status)) {
                return res.status(400).json({
                    'message': "Invalid Status"
                })
            }

            if(count < 1){
                return res.status(400).json({
                    'message': 'Count must be atleast 1'
                })
            }
        }

        // update the database entry

        await AttendanceDay.create({
            user: req.user,
            date: normalizedDate,
            isHoliday: !!isHoliday,
            overrideDay: overrideDay || null,
            records: records
        })

        res.sendStatus(201)

    } catch (error){
        console.error(error)
        res.sendStatus(500)
    }

}

const putAttendanceDate = async (req, res) => {
    const date = req.params.date

    const { isHoliday, overrideDay, records } = req.body

    if(!date) return res.status(400).json({
        'message': 'Date parameter is required'
    })

    const d = new Date(date)

    if(isNaN(d)) return res.status(400).json({
        'message': 'Invalid date entry'
    })

    const normalizedDate = d.toISOString().split('T')[0]

    if(!Array.isArray(records)) return res.status(400).json({
        'message': 'Records must be an array'
    })

    try {
        const foundDay = await AttendanceDay.findOne({user: req.user, date: normalizedDate})        
        if(!foundDay) return res.status(404).json({
            'message': "Attendance record for this day not found"
        })

        //validate each record
        const userCourses = await Course.find({ user: req.user })
        const validCourseIds = new Set(
            userCourses.map(course => course._id.toString())
        )

        for(const record of records) {
            const { course, status, count } = record

            if(!validCourseIds.has(course)) {
                return res.status(400).json({
                    'message': "Invalid course in records"
                })
            }

            if(!["attended", "missed", "cancelled"].includes(status)) {
                return res.status(400).json({
                    'message': "Invalid Status"
                })
            }

            if(count < 1){
                return res.status(400).json({
                    'message': 'Count must be atleast 1'
                })
            }
        }

        foundDay.isHoliday = !!isHoliday
        foundDay.overrideDay = overrideDay || null
        foundDay.records = records

        await foundDay.save()

        res.sendStatus(204)

    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }

}

const getAttendanceRange = async (req, res) => {
    const { start, end } = req.query

    if(!start || !end) return res.status(400).json({
        'message': "Start and end dates are required"
    })

    const start_d = new Date(start)
    const end_d = new Date(end)

    if(isNaN(start_d) || isNaN(end_d)) return res.status(400).json({
        'message': "Invalid start or end date format"
    })

    const startNormalized = start_d.toISOString().split('T')[0]
    const endNormalized = end_d.toISOString().split('T')[0]

    try {
        const days = await AttendanceDay.find({
            user: req.user,
            date: {$gte: startNormalized, $lte: endNormalized}
        }).sort({ date: 1 }).select("date isHoliday records")

        res.json(days)

    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}

module.exports = { getAttendanceDate, postAttendance, putAttendanceDate, getAttendanceRange }