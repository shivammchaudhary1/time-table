import express from 'express';
import {
  generateTimetable,
  getTimetable,
  getConflicts,
} from '../controllers/timetable.controller.js';

const timetableRouter = express.Router();

timetableRouter.post('/generate', generateTimetable);
timetableRouter.get('/', getTimetable);
timetableRouter.get('/conflicts', getConflicts);

export default timetableRouter;
