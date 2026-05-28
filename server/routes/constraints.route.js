import express from 'express';
import { getConstraints, updateConstraints } from '../controllers/constraints.controller.js';
import auth from '../middleware/auth.middleware.js';

const constraintRouter = express.Router();

constraintRouter.get('/', auth, getConstraints);
constraintRouter.put('/', auth, updateConstraints);

export default constraintRouter;
