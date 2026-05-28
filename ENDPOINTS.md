# Backend API Endpoints

This document lists all the available backend API endpoints for the time-table application.

## Authentication

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Login an existing user.
- `POST /api/auth/refresh`: Refresh the access token.
- `POST /api/auth/logout`: Logout the current user.

## User Profile

- `GET /api/user/profile`: Get the current user's profile.
- `POST /api/user/change-password`: Change the current user's password.

## Courses

- `GET /api/courses`: Get all courses for the current user.
- `POST /api/courses`: Create a new course.
- `PUT /api/courses/:id`: Update an existing course.
- `DELETE /api/courses/:id`: Delete a course.

## Constraints

- `GET /api/constraints`: Get the current user's constraints.
- `PUT /api/constraints`: Update the current user's constraints.

## Rooms

- `GET /api/rooms`: Get all rooms for the current user.
- `POST /api/rooms`: Create a new room.
- `PUT /api/rooms/:id`: Update an existing room.
- `DELETE /api/rooms/:id`: Delete a room.

## Timetable

- `POST /api/timetable/generate`: Generate a new timetable.
- `GET /api/timetable`: Get the latest timetable for the current user.
  -- `GET /api/timetable/conflicts`: Get conflicts for the current timetable.
