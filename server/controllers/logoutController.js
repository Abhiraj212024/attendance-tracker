const User = require('../models/User')

const handleLogout = async (req, res) => {
    const refreshToken = req.cookies?.jwt

    if(!refreshToken) return res.sendStatus(204);

    try {
        // find a user with this refreshToken
        const foundUser = await User.findOne({ refreshToken }).exec()

        if(foundUser) {
            // remove refreshToken from DB
            foundUser.refreshToken = ""
            await foundUser.save()

        }

        //clear cookie
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "Lax", // change to None during production
            secure: false // change to true during production
        })

        res.sendStatus(204)

    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}

module.exports = { handleLogout }