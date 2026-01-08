const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if(!authHeader?.startsWith('Bearer ')){
        return res.status(401).send({
            'message': 'token not received correctly'
        })
    }

    const token = authHeader.split(' ')[1] //standard documentation procedure

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err){
                console.log(err)
                return res.sendStatus(403) //invalid token
            }
            req.user = decoded.UserInfo.id
            next()
        }
    )
}

module.exports = { verifyJWT }