import express from 'express';
import {
  generateTimetable,
  getTimetable,
  getConflicts,
} from '../controllers/timetable.controller.js';
import auth from '../middleware/auth.middleware.js';

const timetableRouter = express.Router();

timetableRouter.post('/generate', auth, generateTimetable);
timetableRouter.get('/', auth, getTimetable);
timetableRouter.get('/conflicts', auth, getConflicts);

export default timetableRouter;
