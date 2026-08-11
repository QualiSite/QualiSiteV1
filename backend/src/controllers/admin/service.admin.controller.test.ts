import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import { prisma } from '../../models/client.js';

const JWT_SECRET = process.env.JWT_SECRET!;

function makeAdminToken() {
  return jwt.sign({ userId: '550e8400-e29b-41d4-a716-446655440000', role: 'ADMIN' }, JWT_SECRET, {
    audience: 'access',
    expiresIn: 3600,
  });
}

const mockService = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  title: 'Site Vitrine',
  description: 'Un site pro',
  iconUrl: null,
  price: 1200 as any,
  order: 1,
  isActive: true,
  createdAt: new Date(),
  deletedAt: null,
};

// ── GET /api/admin/services ───────────────────────────

describe('GET /api/admin/services', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return the list of services for an admin', async () => {
    vi.spyOn(prisma.service, 'findMany').mockResolvedValue([mockService]);

    const response = await request(app)
      .get('/api/admin/services')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should return 401 without a token', async () => {
    const response = await request(app).get('/api/admin/services');
    expect(response.status).toBe(401);
  });
});

// ── POST /api/admin/services ──────────────────────────

describe('POST /api/admin/services', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 201 on valid service creation', async () => {
    vi.spyOn(prisma.service, 'create').mockResolvedValue(mockService);

    const response = await request(app)
      .post('/api/admin/services')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ title: 'Site Vitrine', price: 1200 });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Site Vitrine');
  });

  it('should return 400 when price is missing', async () => {
    const response = await request(app)
      .post('/api/admin/services')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ title: 'Sans prix' });

    expect(response.status).toBe(400);
  });
});

// ── PATCH /api/admin/services/:id ─────────────────────

describe('PATCH /api/admin/services/:id', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 200 on successful update', async () => {
    vi.spyOn(prisma.service, 'findFirst').mockResolvedValue(mockService);
    vi.spyOn(prisma.service, 'update').mockResolvedValue({
      ...mockService,
      title: 'Nouveau titre',
    });

    const response = await request(app)
      .patch(`/api/admin/services/${mockService.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ title: 'Nouveau titre' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Nouveau titre');
  });

  it('should return 404 when service does not exist', async () => {
    vi.spyOn(prisma.service, 'findFirst').mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/admin/services/${mockService.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ title: 'Nouveau titre' });

    expect(response.status).toBe(404);
  });
});

// ── DELETE /api/admin/services/:id ────────────────────

describe('DELETE /api/admin/services/:id', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 204 on successful soft delete', async () => {
    vi.spyOn(prisma.service, 'findFirst').mockResolvedValue(mockService);
    vi.spyOn(prisma.service, 'update').mockResolvedValue({
      ...mockService,
      deletedAt: new Date(),
    });

    const response = await request(app)
      .delete(`/api/admin/services/${mockService.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(204);
  });

  it('should return 404 when service does not exist', async () => {
    vi.spyOn(prisma.service, 'findFirst').mockResolvedValue(null);

    const response = await request(app)
      .delete(`/api/admin/services/${mockService.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(404);
  });
});
