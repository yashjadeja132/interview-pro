// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/interviewSystem';
    console.log(`MongoDB URI: ${mongoURI}`);
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
