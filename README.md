# Smart Timetable - AI-Powered Timetable Generator

A full-stack application for generating intelligent timetables using Express.js backend and React frontend with MongoDB database.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (running locally or remote connection string)

### Installation

1. **Clone and Setup**

```bash
cd smart-timetable
```

2. **Install Dependencies**

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd client
npm install
cd ..
```

3. **Environment Setup**

Backend (create `.env` file in `server/`):

```bash
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and settings
```

Frontend (create `.env` file in `client/`):

```bash
cp client/.env.example client/.env
# Edit client/.env if needed
```

---

## 📋 Running the Application

### **Local Development (Recommended)**

#### Option 1: Run Frontend and Backend Together

```bash
cd server
npm run dev:full
```

This starts:

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

#### Option 2: Run Separately in Different Terminals

Terminal 1 - Backend:

```bash
cd server
npm run dev
```

Terminal 2 - Frontend:

```bash
cd client
npm run dev
```

### **Production Build**

1. **Build Frontend**

```bash
cd client
npm run build
cd ..
```

2. **Run in Production Mode**

```bash
cd server
NODE_ENV=production npm start
```

The server will serve the built frontend at `http://localhost:5000`

#### Or Full Build & Run:

```bash
cd server
npm run build:full
```

---

## 📁 Project Structure

```
smart-timetable/
├── server/                    # Express.js backend
│   ├── config/               # Database configuration
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── middleware/           # Authentication middleware
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
│
└── client/                    # React frontend
    ├── src/
    │   ├── components/       # React components
    │   ├── styles/          # CSS files
    │   ├── api/             # API calls
    │   └── App.jsx          # Main app component
    ├── vite.config.js       # Vite configuration
    └── package.json         # Frontend dependencies
```

---

## 🔧 Available Commands

### Backend Commands

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `npm start`          | Run server in production              |
| `npm run dev`        | Run server with auto-reload (nodemon) |
| `npm run dev:full`   | Run backend + frontend together       |
| `npm run start:full` | Run both in production mode           |
| `npm run build`      | Build frontend                        |
| `npm run build:full` | Build frontend and run server         |

### Frontend Commands

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm start`       | Start Vite dev server    |
| `npm run dev`     | Same as start            |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

---

## 🌍 Environment Variables

### Backend (.env)

```
MONGO_URI=mongodb://localhost:27017/smart-timetable
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000
VITE_MODE=development
```

---

## 🔌 API Endpoints

- **Auth**: `/api/auth` - Registration & Login
- **Courses**: `/api/courses` - Course management
- **Rooms**: `/api/rooms` - Room management
- **Constraints**: `/api/constraints` - Time/resource constraints
- **Timetable**: `/api/timetable` - Generate & manage timetables
- **Health**: `/api/health` - Server status check

---

## 🗄️ Database

- **Type**: MongoDB
- **Default**: `mongodb://localhost:27017/smart-timetable`
- **Collections**: Users, Courses, Rooms, Constraints, Timetables

---

## 🐛 Troubleshooting

### Backend won't start

- Ensure MongoDB is running
- Check PORT 5000 is not in use: `netstat -ano | findstr :5000`
- Verify `.env` file exists in server/

### Frontend won't connect

- Check vite.config.js proxy is pointing to `http://localhost:5000`
- Ensure backend is running
- Clear browser cache and reload

### CORS Errors

- Backend allows all origins (CORS enabled)
- Check backend is running and accessible

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

---

## 📦 Dependencies

### Backend

- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs (Password hashing)
- dotenv (Environment variables)

### Frontend

- React 19+
- Vite (Build tool)
- Axios (HTTP client)
- ESLint (Code quality)

---

## 🚢 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Update `MONGO_URI` to production database
3. Update `JWT_SECRET` to strong random key
4. Build frontend: `npm run build`
5. Run: `npm start`

---

## 📝 License

Proprietary - AI-Powered Smart Timetable Generator

---

## 💡 Support

For issues or questions, check the project documentation or contact the development team.
