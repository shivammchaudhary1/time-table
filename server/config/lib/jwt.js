import jwt from 'jsonwebtoken';
import envs from '../envs.js';

export const generateAccessToken = ({ userId, role }) => {
  try {
    if (!userId) {
      throw new Error('Payload with userId is required to generate access token');
    }

    const token = jwt.sign({ userId, role }, envs.jwt_access_secret_key, {
      expiresIn: envs.jwt_access_expiration || '15m',
      algorithm: 'HS256',
    });

    return token;
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error.message}`, { cause: error });
  }
};

export const generateRefreshToken = ({ userId, role }) => {
  try {
    if (!userId) {
      throw new Error('Payload with userId is required to generate refresh token');
    }

    const token = jwt.sign({ userId, role }, envs.jwt_refresh_secret_key, {
      expiresIn: envs.jwt_refresh_expiration || '7d',
      algorithm: 'HS256',
    });

    return token;
  } catch (error) {
    throw new Error(`Failed to generate refresh token: ${error.message}`, { cause: error });
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
      throw new Error('Access token has expired', { cause: error });
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token', { cause: error });
    }
    throw new Error(`Access token verification failed: ${error.message}`, { cause: error });
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
      throw new Error('Refresh token has expired', { cause: error });
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token', { cause: error });
    }
    throw new Error(`Refresh token verification failed: ${error.message}`, { cause: error });
  }
};
