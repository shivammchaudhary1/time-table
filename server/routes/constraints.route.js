import express from 'express';
import { getConstraints, updateConstraints } from '../controllers/constraints.controller.js';

const constraintRouter = express.Router();

constraintRouter.get('/', getConstraints);
constraintRouter.put('/', updateConstraints);

export default constraintRouter;
