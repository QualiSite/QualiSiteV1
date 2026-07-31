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

const authRouter = Router();

// ── Publiques ─────────────────────────────────────
authRouter.post('/register', registerUser);
authRouter.get('/verify-email', verifyEmail);
authRouter.post('/login', loginUser);
authRouter.post('/refresh', refreshAccessToken);

// ── Protégées ─────────────────────────────────────
authRouter.get('/me', verifyToken, getMe);
authRouter.post('/logout', verifyToken, logoutUser);

export default authRouter;
