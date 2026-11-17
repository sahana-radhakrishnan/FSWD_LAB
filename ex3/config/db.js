const mongoose = require('mongoose');

let connectionPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (connectionPromise) return connectionPromise;

  const mongoURI = process.env.MONGODB_URI ||
    (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/leave-management');

  if (!mongoURI) {
    throw new Error('MONGODB_URI is not configured. Add your MongoDB connection string to the environment variables.');
  }

  connectionPromise = mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000
  }).then(() => {
    console.log('MongoDB connected successfully');
  }).catch((error) => {
    connectionPromise = undefined;
    throw error;
  });

  try {
    await connectionPromise;
  } finally {
    if (mongoose.connection.readyState === 1) connectionPromise = undefined;
  }
}

module.exports = connectDB;
