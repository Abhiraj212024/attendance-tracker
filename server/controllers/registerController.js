const bcrypt = require('bcrypt')
const User = require('../models/User')
// load the users db


const handleRegistration = async (req, res) => {
    // extract name, email and password

    const { name, email, password } = req.body

    if(!name || !email || !password){
        return res.status(400).json({
            'message': "Name, Email and Password are required"
        })
    }
    try {
    //check duplicate email in database
    const duplicate = await User.findOne({ email }).exec()

    if(duplicate) return res.sendStatus(409) // conflict


        //encrypt password
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = {
            'name': name,
            'email': email,
            'password': hashedPassword
        }

        // add new user to database
        await User.create(newUser)

        res.status(201).json({'success': `New User ${email} created!`})
    } catch (error) {
        res.status(500).json({
            'message': error.message
        })
    }
}

module.exports = { handleRegistration }