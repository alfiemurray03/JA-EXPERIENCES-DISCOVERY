/**
 * Security headers middleware
 * Applied globally in entry.ts before all routes.
 *
 * UK GDPR / NCSC guidance alignment:
 * - HSTS: enforces HTTPS, prevents downgrade attacks
 * - CSP: restricts script/style/frame sources
 * - X-Frame-Options: clickjacking protection
 * - X-Content-Type-Options: MIME sniffing protection
 * - Referrer-Policy: limits referrer leakage (PII in URLs)
 * - Permissions-Policy: disables unused browser APIs
 * - Cache-Control on API: prevents caching of personal data
 */
import { type Request, type Response, type NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // HSTS — 1 year, include subdomains (production only; dev has no valid cert)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Limit referrer leakage — important for GDPR (URLs can contain PII)
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable unused browser APIs
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  );

  // Content Security Policy
  // - default-src 'self': only same-origin by default
  // - script-src: allow self + inline scripts needed by Vite SSR hydration
  // - style-src: allow self + inline styles (Tailwind injects inline)
  // - img-src: allow self + data URIs (QR codes) + blob + airo assets CDN
  // - connect-src: allow self + Microsoft OIDC endpoints
  // - frame-ancestors 'none': belt-and-braces clickjacking protection
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",   // unsafe-inline needed for Vite SSR hydration script
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://airo-assets.imgix.net https://*.airoapp.ai",
    "connect-src 'self' https://login.microsoftonline.com https://*.b2clogin.com https://*.ciamlogin.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);

  // Prevent caching of API responses that may contain personal data
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }

  next();
}
