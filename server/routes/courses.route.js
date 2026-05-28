import express from 'express';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courses.controller.js';
import auth from '../middleware/auth.middleware.js';

const courseRouter = express.Router();

courseRouter.get('/', auth, getCourses);
courseRouter.post('/', auth, createCourse);
courseRouter.put('/:id', auth, updateCourse);
courseRouter.delete('/:id', auth, deleteCourse);

export default courseRouter;
