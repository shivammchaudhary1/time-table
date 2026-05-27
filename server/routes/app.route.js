import authRouter from "./auth.js";
import coursesRouter from "./courses.js";
import constraintsRouter from "./constraints.js";
import timetableRouter from "./timetable.js";
import roomsRouter from "./rooms.js";

export const appRoutes = (app) => {
  app.use('/api/auth', authRouter);
  app.use('/api/courses', coursesRouter);
  app.use('/api/constraints', constraintsRouter);
  app.use('/api/timetable', timetableRouter);
  app.use('/api/rooms', roomsRouter);
};
  