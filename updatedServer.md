import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import envs from './config/envs.js';
import { appRoutes } from './routes/app.route.js';

const app = express();

// ========== SECURITY & PERFORMANCE MIDDLEWARE ==========

/\*\*

- HELMET MIDDLEWARE
- ─────────────────
- WHAT: Helmet helps secure Express apps by setting various HTTP headers
- WHY: Protects against common web vulnerabilities like XSS, clickjacking, MIME sniffing
- BENEFITS FOR LEARNING:
- - Prevents XSS (Cross-Site Scripting) attacks by setting Content-Security-Policy
- - Prevents clickjacking via X-Frame-Options
- - Disables MIME type sniffing to prevent malicious downloads
- - Removes X-Powered-By header to hide technology stack
- - Sets strict HSTS (HTTP Strict Transport Security) for HTTPS
- REAL-WORLD: Required for production-grade applications and security compliance
  \*/
  app.use(helmet());

/\*\*

- COMPRESSION MIDDLEWARE
- ──────────────────────
- WHAT: Compresses response bodies for HTTP requests
- WHY: Reduces bandwidth usage and speeds up data transfer
- BENEFITS FOR LEARNING:
- - Reduces response size by 60-80% (e.g., 100KB → 20KB)
- - Faster client-side load times = better user experience
- - Saves server bandwidth costs in production
- - Automatically compresses JSON, HTML, CSS, JavaScript
- - Uses gzip compression algorithm
- REAL-WORLD: Essential for APIs serving large datasets or mobile clients
- HOW IT WORKS: Browser sends "Accept-Encoding: gzip", server compresses and sends
  \*/
  app.use(compression());

/\*\*

- MORGAN HTTP REQUEST LOGGER MIDDLEWARE
- ──────────────────────────────────────
- WHAT: Logs all HTTP requests with details (method, path, status, response time)
- WHY: Tracks API usage, monitors performance, helps debug issues
- BENEFITS FOR LEARNING:
- - See every request hitting your API (GET /api/users, POST /api/courses, etc.)
- - Logs response status codes (200, 404, 500) to identify errors
- - Tracks response time - identify slow endpoints
- - Helps with debugging - can trace request flow
- - Detects suspicious patterns (brute force attempts, invalid requests)
- REAL-WORLD: Essential for monitoring, debugging, and analytics in production
- FORMAT: "GET /api/courses 200 - 45.123 ms"
  \*/
  app.use(morgan('dev')); // 'dev' format shows colorized, concise logs
  // Alternative formats:
  // morgan('combined') - Apache combined log format (more detailed)
  // morgan('common') - Apache common log format
  // morgan('short') - shorter version of combined
  // morgan('tiny') - minimal logging

/\*\*

- RATE LIMITING MIDDLEWARE
- ────────────────────────
- WHAT: Limits number of requests from an IP address in a time window
- WHY: Prevents abuse, DDoS attacks, brute force attacks, and API overuse
- BENEFITS FOR LEARNING:
- - Prevents brute force attacks (e.g., password guessing)
- - Protects from accidental API misuse (infinite loops, bugs)
- - Prevents DDoS attacks by limiting requests per IP
- - Fair resource allocation - one user can't monopolize server
- - Can customize limits per route (auth routes stricter, public routes lenient)
- REAL-WORLD: Critical for public APIs to prevent abuse and maintain performance
  _/
  const limiter = rateLimit({
  windowMs: 15 _ 60 _ 1000, // 15 minutes time window
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in RateLimit-_ headers
  legacyHeaders: false, // Disable X-RateLimit-\* headers
  skip: (req) => envs.node_env === 'development', // Skip rate limiting in development
  });

// Apply rate limiting to all routes
app.use(limiter);

/\*\*

- STRICTER RATE LIMITING FOR AUTH ROUTES
- ───────────────────────────────────────
- WHAT: Applies stricter rate limits to authentication endpoints
- WHY: Auth endpoints are common targets for brute force attacks
- EXAMPLE: Only 5 login attempts per 15 minutes from same IP
  _/
  const authLimiter = rateLimit({
  windowMs: 15 _ 60 \* 1000, // 15 minutes
  max: 5, // only 5 requests per windowMs for auth
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  });

// ========== BODY PARSING MIDDLEWARE ==========

/\*\*

- CORS MIDDLEWARE
- ───────────────
- WHAT: Enables Cross-Origin Resource Sharing
- WHY: Allows frontend (different domain) to access backend API
  \*/
  app.use(cors());

/\*\*

- EXPRESS JSON MIDDLEWARE
- ──────────────────────
- WHAT: Parses incoming JSON request bodies
- WHY: Converts raw JSON to JavaScript objects for easier handling
- LIMIT: Set to reasonable size to prevent large payload attacks
  \*/
  app.use(express.json({ limit: '10mb' })); // Limit request body size to 10MB

// ========== ROUTES ==========

/\*\*

- HEALTH CHECK ENDPOINT
- ────────────────────
- WHAT: Returns basic API information
- WHY: Used for monitoring, health checks, and API versioning
  \*/
  app.get('/', (req, res) => {
  res.json({
  message: 'Welcome to the Time Table API!',
  time: new Date().toISOString(),
  day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  });
  });

/\*\*

- APPLY STRICTER AUTH LIMITER TO AUTH ROUTES
- ──────────────────────────────────────────
- Example: If auth route is registered, apply stricter limiter
- Uncomment when auth routes are set up:
- app.use('/api/auth', authLimiter);
  \*/

// Register all application routes
appRoutes(app);

/\*\*

- ERROR HANDLING MIDDLEWARE
- ────────────────────────
- WHAT: Catches and handles errors from routes
- WHY: Prevents unhandled errors from crashing the server
- BENEFITS: Provides consistent error responses to clients
  \*/
  app.use((err, req, res, next) => {
  console.error(chalk.red('Error:'), err.message);
  res.status(err.status || 500).json({
  success: false,
  message: err.message || 'Internal Server Error',
  error: envs.node_env === 'development' ? err : {}, // Don't expose errors in production
  });
  });

/\*\*

- 404 NOT FOUND MIDDLEWARE
- ────────────────────────
- WHAT: Catches requests to undefined routes
- WHY: Provides user-friendly response for invalid endpoints
  \*/
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
