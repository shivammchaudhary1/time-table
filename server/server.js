import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import connectDB from './config/db.js';
import envs from './config/envs.js';
import { appRoutes } from './routes/app.route.js';

const app = express();
const PORT = envs.port;

// ========== Middleware ==========
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(chalk.cyan(`[${timestamp}] ${req.method.toUpperCase()} ${req.path}`));
  next();
});

// ========== Database Connection ==========
connectDB();

// ========== Routes ==========
appRoutes(app);

// ========== Health Check ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: envs.node_env });
});

// ========== Root Route ==========
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Smart Timetable API', version: '1.0.0' });
});

// ========== 404 Handler ==========
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// ========== Error Handler ==========
app.use((err, req, res, next) => {
  console.error(chalk.red('Error:'), err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ========== Start Server ==========
app.listen(PORT, () => {
  console.log(chalk.green.bold(`\n🚀 Server started successfully!`));
  console.log(chalk.blue(`   Environment: ${envs.node_env}`));
  console.log(chalk.blue(`   Port: ${PORT}`));
  console.log(chalk.blue(`   URL: http://localhost:${PORT}\n`));
});
