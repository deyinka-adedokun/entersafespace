import type { Express } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Backend Audit #20 (rate limiting) and #21 (security headers).
 * Call this once, right after app.use(express.json()).
 */
export function applySecurity(app: Express) {
  app.use(helmet({
    // The app serves its own frontend from the same origin (Vite/static
    // build), so a strict default CSP would need real tuning against the
    // actual asset/script sources before enabling contentSecurityPolicy.
    // Leaving it off for now rather than shipping a broken or falsely
    // reassuring policy; the other helmet protections (X-Content-Type-Options,
    // Referrer-Policy, frame protection, etc.) are still applied.
    contentSecurityPolicy: false
  }));

  // Tight limiter for the highest-abuse-risk auth endpoints: brute-forcing
  // login, spamming registration, or hammering OTP resend.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes and try again.' } }
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
  app.use('/api/v1/auth/verify-otp', authLimiter);
  app.use('/api/v1/auth/resend-otp', authLimiter);

  // Looser general limiter for everything else under /api/, so the app
  // stays usable under ordinary traffic but a scripted flood still gets cut off.
  const generalApiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } }
  });

  app.use('/api/', generalApiLimiter);
}
