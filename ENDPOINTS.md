# Time-Table Server API Guide and Test Report

This file explains what each backend endpoint does and records a full endpoint-by-endpoint test run.

## Existing Structure (Analyzed First)

- **Framework:** Express server with middleware (`helmet`, `compression`, `morgan`, `cookie-parser`, CORS, rate limiter).
- **Database:** MongoDB via Mongoose.
- **Auth model:** JWT access token (`Authorization: Bearer <token>`) + refresh token stored in HttpOnly cookie.
- **Business modules:**
  - Auth and user profile
  - Courses CRUD
  - Rooms CRUD
  - Constraints read/update
  - Timetable generate/retrieve/conflicts

## Endpoint Reference

### Root

- `GET /`
  - Returns basic API welcome payload with current time and day.
  - Authentication: `No`

### Authentication

- `POST /api/auth/register`
  - Creates a new user account.
  - Required body fields: `email`, `password`, `firstName`, `lastName`
  - Authentication: `No`

- `POST /api/auth/login`
  - Validates credentials, sets `refreshToken` cookie, returns access token and user summary.
  - Required body fields: `email`, `password`
  - Authentication: `No`

- `POST /api/auth/refresh`
  - Reads `refreshToken` cookie and issues a new access token.
  - Authentication: `Refresh cookie required`

- `POST /api/auth/logout`
  - Clears stored refresh token and removes refresh cookie.
  - Authentication: `Yes` (access token)

### User Profile

- `GET /api/user/profile`
  - Returns current authenticated user profile.
  - Authentication: `Yes`

- `POST /api/user/change-password`
  - Changes current user password and invalidates refresh token.
  - Required body fields: `currentPassword`, `newPassword`
  - Authentication: `Yes`

### Courses

- `GET /api/courses`
  - Returns courses for authenticated user.
  - Authentication: `Yes`

- `POST /api/courses`
  - Creates a course tied to authenticated user.
  - Typical fields: `name`, `instructor`, `duration`, `sessionsPerWeek`, `preferredDays`, `color`
  - Authentication: `Yes`

- `PUT /api/courses/:id`
  - Updates a specific course of authenticated user.
  - Authentication: `Yes`

- `DELETE /api/courses/:id`
  - Deletes a specific course of authenticated user.
  - Authentication: `Yes`

### Rooms

- `GET /api/rooms`
  - Returns rooms for authenticated user.
  - Authentication: `Yes`

- `POST /api/rooms`
  - Creates a room tied to authenticated user.
  - Typical fields: `name`, `capacity`, `availableDays`, `availableFrom`, `availableTo`
  - Authentication: `Yes`

- `PUT /api/rooms/:id`
  - Updates a specific room of authenticated user.
  - Authentication: `Yes`

- `DELETE /api/rooms/:id`
  - Deletes a specific room of authenticated user.
  - Authentication: `Yes`

### Constraints

- `GET /api/constraints`
  - Returns user constraints; creates defaults if not present.
  - Authentication: `Yes`

- `PUT /api/constraints`
  - Updates user constraints.
  - Typical fields: `maxHoursPerDay`, `activeDays`, `dayStartHour`, `dayEndHour`, `lunchBreakStart`, `lunchBreakEnd`, `blockedSlots`
  - Authentication: `Yes`

### Timetable

- `POST /api/timetable/generate`
  - Generates timetable from user courses + constraints + rooms.
  - Stores generated timetable and returns `timetable`, `conflicts`, `suggestions`.
  - Authentication: `Yes`

- `GET /api/timetable`
  - Returns latest timetable and conflict analysis.
  - Authentication: `Yes`

- `GET /api/timetable/conflicts`
  - Returns conflict list and suggestions for latest timetable.
  - Authentication: `Yes`

## Errors Found and Fixed

1. Missing auth middleware on `courses`, `rooms`, `constraints`, `timetable` routes caused `req.userId` to be undefined.
2. Refresh endpoint compared against `user.refreshToken` without selecting hidden field from DB.
3. Change-password endpoint called `user.clearTokens()` which does not exist on user model.

## Retest Result (After Fixes)

All endpoints were retested one by one after applying fixes.

- Pass: root, register, login, refresh, profile, change-password
- Pass: courses get/create/update/delete
- Pass: rooms get/create/update/delete
- Pass: constraints get/put
- Pass: timetable generate/get/conflicts
- Pass: logout

Status: `All tested endpoints are working as expected after fixes.`
