import { Router } from 'express';
import {
  registerUser,
  verifyEmail,
  loginUser,
  refreshAccessToken,
  getMe,
  logoutUser,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rate-limit.middleware.js';

const authRouter = Router();

// ── Publiques ─────────────────────────────────────
authRouter.post('/register', authLimiter, registerUser);
authRouter.get('/verify-email', verifyEmail);
authRouter.post('/login', authLimiter, loginUser);
authRouter.post('/refresh', refreshAccessToken);

// ── Protégées ─────────────────────────────────────
authRouter.get('/me', verifyToken, getMe);
authRouter.post('/logout', verifyToken, logoutUser);

export default authRouter;
