import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import connectDB from './config/db.js';
import envs from './config/envs.js';
import { appRoutes } from './routes/app.route.js';
import { limiter } from './utils/limiter.js';

const app = express();

// ========== SECURITY & PERFORMANCE MIDDLEWARE ==========

app.use(helmet()); // Set secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.) to protect against common vulnerabilities
app.use(compression()); // Enable gzip compression for responses 70-80% smaller payloads, faster transfers
app.use(morgan('dev')); // 'dev' format shows colorized, concise logs
app.use(limiter); // Apply rate limiting to all routes
app.use(cors()); // Enable CORS for all origins (adjust as needed for production)
app.use(express.json({ limit: '10mb' })); // Limit request body size to 10MB
appRoutes(app); // Register all application routes

// ========== ROUTES ==========
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Time Table API!',
    time: new Date().toISOString(),
    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  });
});

app.use((err, req, res, next) => {
  console.error(chalk.red('Error:'), err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: envs.node_env === 'development' ? err : {}, // Don't expose errors in production
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ========== START SERVER ==========
app.listen(envs.port, async () => {
  // ========== DATABASE CONNECTION ==========
  await connectDB();
  console.log(chalk.green.bold(`\n🚀 Server started successfully!`));
  console.log(chalk.blue(`   Environment: ${envs.node_env}`));
  console.log(chalk.blue(`   Port: ${envs.port}`));
  console.log(chalk.blue(`   URL: http://localhost:${envs.port}`));
  console.log(chalk.cyan(`   Morgan Logging: Enabled (request tracking)`));
  console.log(chalk.cyan(`   Helmet Security: Enabled (HTTP headers protection)`));
  console.log(chalk.cyan(`   Compression: Enabled (response gzip compression)`));
  console.log(
    chalk.cyan(
      `   Rate Limiting: ${envs.node_env === 'development' ? 'Disabled in dev' : 'Enabled (100 req/15min)'}\n`
    )
  );
});
