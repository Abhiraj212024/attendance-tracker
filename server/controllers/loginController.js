const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    
    if(!email || !password) return res.status(400).json({
        'message': 'email and password are required'
    })

    // find the user in db
    const foundUser = await User.findOne({email}).exec()

    if(!foundUser) return res.sendStatus(401);

    try {
        // match the input password
        const match = await bcrypt.compare(password, foundUser.password)
        if(!match) return res.status(401).json({
            'message': 'password did not match'
        })

        // password matched: create access and refresh token
        const accessToken = jwt.sign({'email': foundUser.email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
        const refreshToken = jwt.sign({'email': foundUser.email}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })

        // save the updated user to database
        foundUser.refreshToken = refreshToken
        await foundUser.save()


        const cookieAge = 24 * 60 * 60 * 1000 // cookie age: 1d

        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: cookieAge, sameSite: 'strict', secure: false }) // set secure to true in production
        res.json({ accessToken })
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
}

module.exports = { handleLogin }