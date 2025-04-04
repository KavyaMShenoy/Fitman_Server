const { default: mongoose } = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected successfully.");
    } catch (error) {
        console.log("An error occured.", error.message);
    }
}

module.exports = connectDB;