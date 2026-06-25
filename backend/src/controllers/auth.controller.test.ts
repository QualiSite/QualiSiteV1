import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { prisma } from '../models/client.js';
import * as mailer from '../lib/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET!;

const validRegisterBody = {
  email: 'test@example.com',
  password: 'Password1!',
  confirmPassword: 'Password1!',
};

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'admin@example.com',
  passwordHash: '', // sera remplacé dans chaque test
  role: 'ADMIN' as any,
  isActive: true,
  verifyToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// Helper — génère un access token valide
function makeAccessToken(userId = mockUser.id, role = 'ADMIN') {
  return jwt.sign({ userId, role }, JWT_SECRET, { audience: 'access', expiresIn: 3600 });
}

// ── REGISTER ─────────────────────────────────────────

describe('POST /auth/register', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 201 on valid registration', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null); // email pas pris
    vi.spyOn(prisma.user, 'create').mockResolvedValue({ ...mockUser, isActive: false });
    vi.spyOn(mailer, 'sendVerificationEmail').mockResolvedValue(undefined as any);

    const response = await request(app).post('/auth/register').send(validRegisterBody);

    expect(response.status).toBe(201);
  });

  it('should return 409 when email is already taken', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

    const response = await request(app).post('/auth/register').send(validRegisterBody);

    expect(response.status).toBe(409);
  });

  it('should return 400 when password is too weak', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ ...validRegisterBody, password: 'weak', confirmPassword: 'weak' });

    expect(response.status).toBe(400);
  });

  it('should return 400 when passwords do not match', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ ...validRegisterBody, confirmPassword: 'Different1!' });

    expect(response.status).toBe(400);
  });
});

// ── LOGIN ─────────────────────────────────────────────

describe('POST /auth/login', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 200 with accessToken on valid credentials', async () => {
    const argon2 = await import('argon2');
    const hash = await argon2.hash('Password1!');

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...mockUser, passwordHash: hash });
    vi.spyOn(prisma.refreshToken, 'deleteMany').mockResolvedValue({ count: 0 });
    vi.spyOn(prisma.refreshToken, 'create').mockResolvedValue({} as any);

    const response = await request(app)
      .post('/auth/login')
      .send({ email: mockUser.email, password: 'Password1!' });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
  });

  it('should return 401 when user does not exist', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password1!' });

    expect(response.status).toBe(401);
  });

  it('should return 401 when password is wrong', async () => {
    const argon2 = await import('argon2');
    const hash = await argon2.hash('CorrectPassword1!');

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...mockUser, passwordHash: hash });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: mockUser.email, password: 'WrongPassword1!' });

    expect(response.status).toBe(401);
  });

  it('should return 401 when account is not activated', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...mockUser, isActive: false });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: mockUser.email, password: 'Password1!' });

    expect(response.status).toBe(401);
  });
});

// ── LOGOUT ────────────────────────────────────────────

describe('POST /auth/logout', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 204 when token is valid', async () => {
    vi.spyOn(prisma.refreshToken, 'deleteMany').mockResolvedValue({ count: 1 });

    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${makeAccessToken()}`);

    expect(response.status).toBe(204);
  });

  it('should return 401 when no token is provided', async () => {
    const response = await request(app).post('/auth/logout');
    expect(response.status).toBe(401);
  });
});