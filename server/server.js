require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const PORT = process.env.PORT || 5001;
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/dbConn');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions')
const app = express();
const verifyJWT = require('./middleware/verifyJWT')

// Add database
connectDB();

app.use(logger)

// CRITICAL: CORS must be the FIRST middleware - using simple config for development
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // preflight OPTIONS request for all routes

// Other middlewares
app.use(express.urlencoded({ extended: false })); // form data
app.use(express.json()); // json

app.use(cookieParser()); // cookies (refresh token)

// Routes
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use("/refresh", require('./routes/refresh'))
app.use("/logout", require('./routes/logout'))

app.use(verifyJWT)

app.use('/semester', require('./routes/semester'))
app.use('/courses', require('./routes/courses'))
app.use('/attendance', require('./routes/attendance'))
app.use('/debug', require('./routes/debug'))


app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on Port ${PORT}`);
    });
});