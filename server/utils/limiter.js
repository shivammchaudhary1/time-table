import rateLimit from 'express-rate-limit';
import envs from '../config/envs.js';

/**
 * APPLY STRICTER AUTH LIMITER TO AUTH ROUTES
 * ──────────────────────────────────────────
 * Example: If auth route is registered, apply stricter limiter
 * Uncomment when auth routes are set up:
 * app.use('/api/auth', authLimiter);
 */

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes time window
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: () => envs.node_env === 'development', // Skip rate limiting in development
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // only 5 requests per windowMs for auth
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
