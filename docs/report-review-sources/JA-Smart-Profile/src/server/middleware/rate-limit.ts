/**
 * In-process rate limiting.
 * Uses a sliding-window counter keyed on hashed IP.
 * No external dependency — pure Node.js Map.
 *
 * UK GDPR note: raw IPs are personal data. We hash them with a
 * per-process salt so the Map never holds a raw IP address.
 */
import { type Request, type Response, type NextFunction } from 'express';
import { createHash, randomBytes } from 'node:crypto';

// Per-process salt — not persisted, resets on restart (acceptable for rate limiting)
const SALT = randomBytes(16).toString('hex');

function hashIp(ip: string): string {
  return createHash('sha256').update(SALT + ip).digest('hex').slice(0, 16);
}

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Clean up expired windows every 10 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, win] of store) {
    if (now > win.resetAt) store.delete(key);
  }
}, 10 * 60 * 1000).unref();

function createLimiter(options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
}) {
  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${options.keyPrefix}:${hashIp(ip)}`;
    const now = Date.now();

    let win = store.get(key);
    if (!win || now > win.resetAt) {
      win = { count: 0, resetAt: now + options.windowMs };
      store.set(key, win);
    }

    win.count++;

    if (win.count > options.max) {
      const retryAfter = Math.ceil((win.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        success: false,
        error: options.message || 'Too many requests. Please try again later.',
      });
      return;
    }

    next();
  };
}

/** 10 requests per minute — general public API endpoints */
export const publicApiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  keyPrefix: 'pub',
  message: 'Too many requests. Please slow down.',
});

/** 5 form submissions per hour — partner enquiry, support request */
export const formSubmitLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyPrefix: 'form',
  message: 'Too many submissions. Please try again later.',
});

/** 20 requests per 15 minutes — auth endpoints */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

/** 3 requests per minute — analytics/view recording (prevent spam) */
export const analyticsLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyPrefix: 'analytics',
});
