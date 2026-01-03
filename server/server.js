require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors')
const express = require('express')
const PORT = process.env.PORT || 5000
const { logger } = require('./middleware/logEvents')
const errorHandler = require('./middleware/errorHandler')
const connectDB = require('./config/dbConn')
const cookieParser = require('cookie-parser')
const app = express()
const corsOptions = require('./config/corsOptions')

//add database
connectDB()

//middlewares
app.use(logger) //custom middleware for logging events
app.use(cors(corsOptions)) //cors: implement whitelist later
app.use(express.urlencoded({extended: false})) // form data
app.use(express.json()) // json
app.use(cookieParser()) // cookies (refresh token)
//app.use(express.static(pathname)) : Change if you have static content to display

//routes
app.use('/register', require('./routes/register'))
// JWT happens
app.use('/login', require('./routes/login'))

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {console.log(`Server running on Port ${PORT}`)})
})