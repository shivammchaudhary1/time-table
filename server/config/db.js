import mongoose from 'mongoose';
import chalk from 'chalk';
import envs from './envs.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(envs.mongo_uri);
    console.log(chalk.green.bold(`✅ MongoDB Connected: ${conn.connection.host}`));
  } catch (error) {
    console.error(chalk.red.bold(`❌ MongoDB Connection Failed: ${error.message}`));
    process.exit(1);
  }
};

export default connectDB;
