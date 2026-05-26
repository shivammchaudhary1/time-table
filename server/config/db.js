import mongoose from 'mongoose';
import envs from './envs.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(envs.mongo_uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
