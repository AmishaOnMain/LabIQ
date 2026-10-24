const mongoose = require("mongoose");

async function connectDB() {
  const target = process.env.DB_TARGET || "local";

  const connections = {
    local: process.env.MONGO_URI_LOCAL,
    atlas: process.env.MONGO_URI_ATLAS,
  };

  if (!Object.hasOwn(connections, target)) {
    throw new Error("Invalid DB_TARGET. Use 'local' or  'atlas'. ");
  }

  const mongoURI = connections[target];

  if (!mongoURI) {
    throw new Error(`Missing MongoDb URI for ${target}. Check your .env file.`);
  }

  try {
    await mongoose.connect(mongoURI);

    console.log(`MongoDB connected successfully (${target})`);
  } catch (error) {
    console.error(`MongoDB connection failed (${target}): `, error.message);
    throw error;
  }
}

module.exports = connectDB;
