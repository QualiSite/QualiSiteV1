import rateLimit from 'express-rate-limit';

// ── Limiteur strict pour les endpoints d'authentification ──
// Protège /auth/login et /auth/register contre le brute-force
// et le credential-stuffing (bien plus restrictif que le rate-limit global).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives, veuillez réessayer plus tard.' },
});
