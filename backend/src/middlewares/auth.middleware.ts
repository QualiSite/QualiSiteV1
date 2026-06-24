import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.js';
import { config } from '../config.js';
import logger from '../lib/logger.js';
import type { UserRole } from '../../generated/prisma/client.js';

// ── Vérifie le token et attache req.user ──────────
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = extractAccessToken(req);
  const { userId, role } = verifyAndDecodeJWT(token);
  req.user = { userId, role: role as UserRole };
  next();
}

// ── Vérifie que le rôle est autorisé ─────────────
export function checkRoles(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = extractAccessToken(req);
    const { userId, role } = verifyAndDecodeJWT(token);

    if (!roles.includes(role as UserRole)) {
      throw new ForbiddenError(`Le rôle ${role} n'a pas la permission d'accéder à cette ressource`);
    }

    req.user = { userId, role: role as UserRole };
    next();
  };
}

// ── Extrait le Bearer token ───────────────────────
function extractAccessToken(req: Request): string {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError("Vous n'êtes pas autorisé à accéder à cette ressource");
  }

  return authHeader.split(' ')[1]!;
}

// ── Vérifie et décode le JWT ──────────────────────
function verifyAndDecodeJWT(accessToken: string): JwtPayload {
  try {
    const payload = jwt.verify(accessToken, config.jwtSecret, {
      audience: 'access',
    }) as JwtPayload;
    return payload;
  } catch (error) {
    logger.warn('JWT verification failed:', error);
    throw new UnauthorizedError("Vous n'êtes pas autorisé à accéder à cette ressource");
  }
}
