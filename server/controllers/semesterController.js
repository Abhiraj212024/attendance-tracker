const User = require('../models/User')

const { normalizedDateOnly } = require('../utils/normalizedDate')

const getSemesterDates = async (req, res) => {
    try {
        const foundUser = await User.findById(req.user).select("semester")
        if(!foundUser) return res.status(400).json({
            'message': 'User not found in database'
        })

        res.json({
            semester: foundUser.semester || null
        })

    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}

const setSemesterDates = async (req, res) => {
    const { start, end } = req.body

    if(!normalizedDateOnly(start) || !normalizedDateOnly(end)) return res.status(401).json({
        'message': 'Invalid Date Formats'
    })

    if(start > end) return res.status(400).json({
        'message': 'Start date cannot be less than end'
    })

    try {
        const foundUser = await User.findById(req.user)
        if(!foundUser) return res.status(400).json({
            'message': 'User not found in database'
        })

        foundUser.semester = { start, end }

        await foundUser.save()

        // FIX: Return the semester data so frontend can use it
        res.status(201).json({
            semester: foundUser.semester
        })

    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}

module.exports = { getSemesterDates, setSemesterDates }