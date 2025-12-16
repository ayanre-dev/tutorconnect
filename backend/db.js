import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB Error: ${err.message}`);
     // process.exit(1);
    console.log("!! DB Connection failed, but keeping server alive for WebRTC !!");
    // console.warn("Continuing without DB for WebRTC testing...");
  }
};

export default connectDB;
