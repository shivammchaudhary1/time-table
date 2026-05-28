import authRouter from './auth.route.js';
import userProfileRouter from './userProfile.route.js';

import coursesRouter from './courses.route.js';
import constraintsRouter from './constraints.route.js';
import timetableRouter from './timetable.route.js';
import roomsRouter from './rooms.route.js';

export const appRoutes = (app) => {
  app.use('/api/auth', authRouter);
  app.use('/api/user', userProfileRouter);

  app.use('/api/courses', coursesRouter);
  app.use('/api/constraints', constraintsRouter);
  app.use('/api/timetable', timetableRouter);
  app.use('/api/rooms', roomsRouter);
};
