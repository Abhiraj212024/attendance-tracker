const whiteList = ['https://www.google.com',
    'http://localhost:3500',
    'http://localhost:5000',
    'http://localhost:5173',
    'http://127.0.0.1:3500',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5173']
const corsOptions = {
    origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1 || !origin){ // remove !origin after develoment
            callback(null, true)
        }else{
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions