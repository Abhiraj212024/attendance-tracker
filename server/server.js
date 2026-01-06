require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const PORT = process.env.PORT || 5000;
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/dbConn');
const cookieParser = require('cookie-parser');
const app = express();

// Add database
connectDB();

app.use(cookieParser()); // cookies (refresh token)

// CRITICAL: CORS must be the FIRST middleware - using simple config for development
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'CORS is working!' });
});

// Other middlewares

app.use(express.urlencoded({ extended: false })); // form data
app.use(express.json()); // json


// Routes
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on Port ${PORT}`);
    });
});