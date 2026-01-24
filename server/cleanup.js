// Run this script once to clean up your database
// node cleanupOrphanedRecords.js

require('dotenv').config();
const mongoose = require('mongoose');
const AttendanceDay = require('./models/AttendanceDay');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Remove all records where course is null
        const result = await AttendanceDay.updateMany(
            {},
            { $pull: { records: { course: null } } }
        );

        console.log(`Cleaned up ${result.modifiedCount} attendance days`);

        await mongoose.connection.close();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

cleanup();