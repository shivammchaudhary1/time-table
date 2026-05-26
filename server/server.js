import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.js";
import coursesRouter from "./routes/courses.js";
import constraintsRouter from "./routes/constraints.js";
import timetableRouter from "./routes/timetable.js";
import roomsRouter from "./routes/rooms.js";
import envs from "./config/envs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = envs.port;

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5000",
    ];

    // Add environment-based URLs
    if (envs.client_url) {
      allowedOrigins.push(envs.client_url.replace(/\/+$/, "")); // Remove trailing slash
    }

    // In production, allow any origin for CORS preflight (OPTIONS requests work)
    // Security is handled by token validation
    if (envs.node_env === "production") {
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS rejected origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies/credentials
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Debug logging for requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to the Smart Timetable API");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/constraints", constraintsRouter);
app.use("/api/timetable", timetableRouter);
app.use("/api/rooms", roomsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (envs.node_env === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
