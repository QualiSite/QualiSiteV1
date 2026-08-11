import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import type { User } from '../../generated/prisma/client.js';

// Empreinte SHA-256 d'un refresh token, stockée en base à la place du
// token brut : une fuite de la base ne donne pas de token directement
// réutilisable (les tokens sont trop peu nombreux/prévisibles pour un
// hash à salage requis, mais on évite de conserver le secret en clair).
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateAuthTokens(user: User) {
  const payload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiresIn,
    audience: 'access',
  });

  const refreshUniqueId = crypto.randomBytes(128).toString('base64');
  const refreshToken = jwt.sign({ refreshId: refreshUniqueId }, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
    audience: 'refresh',
  });

  return {
    accessToken: {
      token: accessToken,
      expiresIn: config.jwtAccessExpiresIn * 1000,
    },
    refreshToken: {
      token: refreshToken,
      expiresIn: config.jwtRefreshExpiresIn * 1000,
    },
  };
}
