const mongoose = require("mongoose");
const uri = process.env.MONGO_URI;

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected with the host: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectDb;
