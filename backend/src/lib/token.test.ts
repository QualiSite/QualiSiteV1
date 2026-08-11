import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateAuthTokens, hashToken } from './token.js';
import { config } from '../config.js';
import type { User } from '../../generated/prisma/client.js';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  role: 'ADMIN',
} as User;

describe('generateAuthTokens', () => {
  it('should sign an access token containing the user id and role', () => {
    const { accessToken } = generateAuthTokens(mockUser);

    const payload = jwt.verify(accessToken.token, config.jwtSecret, {
      audience: 'access',
    }) as jwt.JwtPayload;

    expect(payload.userId).toBe(mockUser.id);
    expect(payload.role).toBe(mockUser.role);
  });

  it('should sign a refresh token with a different audience than the access token', () => {
    const { accessToken, refreshToken } = generateAuthTokens(mockUser);

    expect(() =>
      jwt.verify(refreshToken.token, config.jwtSecret, { audience: 'access' })
    ).toThrow();
    expect(() =>
      jwt.verify(accessToken.token, config.jwtSecret, { audience: 'refresh' })
    ).toThrow();
  });

  it('should generate two distinct refresh tokens on successive calls', () => {
    const first = generateAuthTokens(mockUser);
    const second = generateAuthTokens(mockUser);

    expect(first.refreshToken.token).not.toBe(second.refreshToken.token);
  });
});

describe('hashToken', () => {
  it('should return a deterministic SHA-256 hex digest', () => {
    const hash1 = hashToken('some-token-value');
    const hash2 = hashToken('some-token-value');

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should produce different hashes for different inputs', () => {
    expect(hashToken('token-a')).not.toBe(hashToken('token-b'));
  });

  it('should not return the raw token', () => {
    const raw = 'my-refresh-token';
    expect(hashToken(raw)).not.toBe(raw);
  });
});
