const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { userInfo } = require('node:os')

const handleRefresh = async (req, res) => {
    //read cookie jwt
    const refreshToken = req.cookies?.jwt
    
    if(!refreshToken){
        return res.status(401).json({
            'message': 'Refresh Token Cookie not received correctly'
        })
    }
    try{
        //check jwt in database
        const foundUser = await User.findOne({ refreshToken }).exec()
        if(!foundUser) return res.status(403).json({
            'message': 'Refresh Token not found in database'
        })

        // verify jwt token
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err || foundUser.email != decoded.email){
                    return res.status(403).json({
                        'message': 'Incorrect credentials'
                    })
                }
                //generate new access token
                const accessToken = jwt.sign(
                    {
                        UserInfo: {
                            id: foundUser._id,
                            email: foundUser.email
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {'expiresIn': '10m'}
                )
                //return new access token
                res.json({ accessToken })
            }
        )
    } catch(error) {
        console.error(error)
        res.sendStatus(500)
    }
}

module.exports = { handleRefresh }