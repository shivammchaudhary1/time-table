import express from 'express';
import { register, login, refreshAccessToken, logout } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshAccessToken);
authRouter.post('/logout', auth, logout);

export default authRouter;
