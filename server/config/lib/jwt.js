import jwt from 'jsonwebtoken';
import envs from '../envs.js';

export const generateAccessToken = ({ id, role }) => {
  try {
    if (!id) {
      throw new Error('Payload with id is required to generate access token');
    }

    const token = jwt.sign({ id, role }, envs.jwt_access_secret_key, {
      expiresIn: envs.jwt_access_expiration || '15m',
      algorithm: 'HS256',
    });

    return token;
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error.message}`);
  }
};

export const generateRefreshToken = ({ id, role }) => {
  try {
    if (!id) {
      throw new Error('Payload with id is required to generate refresh token');
    }

    const token = jwt.sign({ id, role }, envs.jwt_refresh_secret_key, {
      expiresIn: envs.jwt_refresh_expiration || '7d',
      algorithm: 'HS256',
    });

    return token;
  } catch (error) {
    throw new Error(`Failed to generate refresh token: ${error.message}`);
  }
};

export const verifyAccessToken = (token) => {
  try {
    if (!token) {
      throw new Error('Access token is required');
    }
    const decoded = jwt.verify(token, envs.jwt_access_secret_key);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw new Error(`Access token verification failed: ${error.message}`);
  }
};

export const verifyRefreshToken = (token) => {
  try {
    if (!token) {
      throw new Error('Refresh token is required');
    }
    const decoded = jwt.verify(token, envs.jwt_refresh_secret_key);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
};
