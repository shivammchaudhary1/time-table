export const ROLE = {
  SUPERADMIN: 'super_admin',
  ADMIN: 'admin', // can add university, faculty, department, course, and manage users
  FACULTY: 'faculty', // can manage courses and students within their faculty
  STUDENT: 'student', // can view courses and schedule and time table
  USER: 'user',
  MODERATOR: 'moderator',
};

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  DELETED: 'deleted',
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
