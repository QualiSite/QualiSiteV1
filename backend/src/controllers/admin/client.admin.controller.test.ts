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

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440003',
  email: 'client@example.com',
  passwordHash: '',
  role: 'CLIENT' as const,
  isActive: false,
  verifyToken: null,
  createdAt: new Date(),
  deletedAt: null,
};

const mockClient = {
  id: '550e8400-e29b-41d4-a716-446655440004',
  userId: mockUser.id,
  name: 'Boulangerie Martin',
  email: 'client@example.com',
  phone: null,
  address: null,
  city: null,
  postalCode: null,
  country: null,
  siret: null,
  companyName: null,
  createdAt: new Date(),
  deletedAt: null,
};

// ── GET /api/admin/clients ────────────────────────────

describe('GET /api/admin/clients', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return the list of clients for an admin', async () => {
    vi.spyOn(prisma.client, 'findMany').mockResolvedValue([mockClient]);

    const response = await request(app)
      .get('/api/admin/clients')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should return 403 when role is CLIENT', async () => {
    const token = jwt.sign({ userId: mockUser.id, role: 'CLIENT' }, JWT_SECRET, {
      audience: 'access',
      expiresIn: 3600,
    });

    const response = await request(app)
      .get('/api/admin/clients')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});

// ── GET /api/admin/clients/:id ────────────────────────

describe('GET /api/admin/clients/:id', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 404 when client does not exist', async () => {
    vi.spyOn(prisma.client, 'findFirst').mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/admin/clients/${mockClient.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(404);
  });
});

// ── POST /api/admin/clients ───────────────────────────

describe('POST /api/admin/clients', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 201 on valid client creation', async () => {
    vi.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
    vi.spyOn(prisma.client, 'create').mockResolvedValue(mockClient);

    const response = await request(app)
      .post('/api/admin/clients')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ name: 'Boulangerie Martin', email: 'client@example.com' });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Boulangerie Martin');
  });

  it('should return 400 when email is invalid', async () => {
    const response = await request(app)
      .post('/api/admin/clients')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ name: 'Boulangerie Martin', email: 'not-an-email' });

    expect(response.status).toBe(400);
  });
});

// ── DELETE /api/admin/clients/:id ─────────────────────

describe('DELETE /api/admin/clients/:id', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 204 on successful soft delete', async () => {
    vi.spyOn(prisma.client, 'findFirst').mockResolvedValue(mockClient);
    vi.spyOn(prisma.client, 'update').mockResolvedValue({
      ...mockClient,
      deletedAt: new Date(),
    });

    const response = await request(app)
      .delete(`/api/admin/clients/${mockClient.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(204);
  });

  it('should return 404 when client does not exist', async () => {
    vi.spyOn(prisma.client, 'findFirst').mockResolvedValue(null);

    const response = await request(app)
      .delete(`/api/admin/clients/${mockClient.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(404);
  });
});
