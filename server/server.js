require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

//add database

app.listen(5000, () => console.log("Server Running!"));