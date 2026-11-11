// config/db.js
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/leave-management";

  try {
    const db = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Do not call process.exit(1) so the app does not crash in serverless/offline environments
  }
};

module.exports = connectDB;
