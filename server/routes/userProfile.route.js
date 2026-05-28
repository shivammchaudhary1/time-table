import express from 'express';
import { changePassword, getProfile } from '../controllers/userProfile.controller.js';
import auth from '../middleware/auth.middleware.js';

const userProfileRouter = express.Router();

userProfileRouter.get('/profile', auth, getProfile);
userProfileRouter.post('/change-password', auth, changePassword);

export default userProfileRouter;
