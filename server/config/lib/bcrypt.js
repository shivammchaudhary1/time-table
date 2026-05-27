import bcrypt from 'bcryptjs';
import envs from './envs.js';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(envs.salt_rounds);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export { hashPassword, comparePassword };
