// backend/src/middlewares/auth.middleware.test.ts

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';

const JWT_SECRET = process.env.JWT_SECRET!;

// Génère un vrai token signé avec notre secret
function makeToken(role: string) {
  return jwt.sign(
    { userId: '550e8400-e29b-41d4-a716-446655440000', role },
    JWT_SECRET,
    { audience: 'access', expiresIn: 3600 }
  );
}

describe('Auth Middleware — routes admin protégées', () => {
  it('should return 401 when no token is provided', async () => {
    const response = await request(app).get('/api/admin/projects');
    expect(response.status).toBe(401);
  });

  it('should return 401 when token is invalid', async () => {
    const response = await request(app)
      .get('/api/admin/projects')
      .set('Authorization', 'Bearer token_invalide');
    expect(response.status).toBe(401);
  });

  it('should return 401 when token is expired', async () => {
    const expired = jwt.sign(
      { userId: '550e8400-e29b-41d4-a716-446655440000', role: 'ADMIN' },
      JWT_SECRET,
      { audience: 'access', expiresIn: -1 } // déjà expiré
    );
    const response = await request(app)
      .get('/api/admin/projects')
      .set('Authorization', `Bearer ${expired}`);
    expect(response.status).toBe(401);
  });

  it('should return 403 when role is CLIENT (not ADMIN)', async () => {
    const token = makeToken('CLIENT');
    const response = await request(app)
      .get('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  it('should pass through when token is valid ADMIN', async () => {
    const token = makeToken('ADMIN');
    // On ne mock pas Prisma ici → la DB va échouer mais ce n'est pas ce qu'on teste
    // On vérifie juste que le middleware laisse passer (pas de 401/403)
    const response = await request(app)
      .get('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });
});