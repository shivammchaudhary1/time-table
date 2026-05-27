import bcrypt from 'bcryptjs';
import envs from './envs.js';

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(envs.salt_rounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
};

const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(`Error comparing passwords: ${error.message}`);
  }
};

export { hashPassword, comparePassword };
