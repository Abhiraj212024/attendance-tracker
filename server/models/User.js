const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true},
    password: String,
    refreshToken: String,
    semester: { 
        start: {type: String}, //YYYY-MM-DD
        end: {type: String}
    }
});

module.exports = mongoose.model("User", userSchema);