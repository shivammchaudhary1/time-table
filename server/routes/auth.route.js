import express from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  changePassword,
  getProfile,
} from '../controllers/auth.controller.js';
import auth from '../middleware/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshAccessToken);
authRouter.post('/logout', auth, logout);
authRouter.get('/profile', auth, getProfile);
authRouter.post('/change-password', auth, changePassword);

export default authRouter;
