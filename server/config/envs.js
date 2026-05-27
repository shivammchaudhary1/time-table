import dotenv from 'dotenv';
dotenv.config();

const envs = {
  port: process.env.PORT || 5000,
  mongo_uri: process.env.MONGO_URI || 'mongodb://localhost:27017/timetable',
  jwt_secret: process.env.JWT_SECRET || 'smart-timetable-secret-key-2024',
  node_env: process.env.NODE_ENV || 'development',
  client_url: process.env.CLIENT_URL || 'http://localhost:5173',
  salt_rounds: parseInt(process.env.SALT_ROUNDS) || 10,
};

export default envs;
