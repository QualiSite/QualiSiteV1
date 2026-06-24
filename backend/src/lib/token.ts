import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import type { User } from '../../generated/prisma/client.js';

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
