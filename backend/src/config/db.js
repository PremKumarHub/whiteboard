const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/whiteboard_db';
    
    // Attempt standard connection
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to local URI (${error.message}). Attempting MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to MongoMemoryServer fallback at ${uri}`);
      return conn;
    } catch (fallbackErr) {
      console.error(`[MongoDB] Fallback connection failed:`, fallbackErr.message);
      // In non-test environments, don't crash hard, let server run with memory state fallback
      return null;
    }
  }
};

module.exports = connectDB;
