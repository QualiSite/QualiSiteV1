import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import { prisma } from '../../models/client.js';
import { ContactStatus } from '../../../generated/prisma/client.js';

const JWT_SECRET = process.env.JWT_SECRET!;

function makeAdminToken() {
  return jwt.sign({ userId: '550e8400-e29b-41d4-a716-446655440000', role: 'ADMIN' }, JWT_SECRET, {
    audience: 'access',
    expiresIn: 3600,
  });
}

const mockContact = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Jean Dupont',
  email: 'jean@example.com',
  subject: 'Devis',
  initialMessage: 'Bonjour, je voudrais un devis.',
  status: ContactStatus.NOUVEAU,
  createdAt: new Date(),
  deletedAt: null,
};

// ── GET /api/admin/contacts ───────────────────────────

describe('GET /api/admin/contacts', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 200 with list of contacts', async () => {
    vi.spyOn(prisma.contact, 'findMany').mockResolvedValue([mockContact]);

    const response = await request(app)
      .get('/api/admin/contacts')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('should return 401 when no token', async () => {
    const response = await request(app).get('/api/admin/contacts');
    expect(response.status).toBe(401);
  });
});

// ── PATCH /api/admin/contacts/:id/status ─────────────

describe('PATCH /api/admin/contacts/:id/status', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 200 when status is updated', async () => {
    vi.spyOn(prisma.contact, 'findFirst').mockResolvedValue(mockContact);
    vi.spyOn(prisma.contact, 'update').mockResolvedValue({
      ...mockContact,
      status: ContactStatus.TRAITE,
    });

    const response = await request(app)
      .patch(`/api/admin/contacts/${mockContact.id}/status`)
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ status: 'TRAITE' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('TRAITE');
  });

  it('should return 404 when contact does not exist', async () => {
    vi.spyOn(prisma.contact, 'findFirst').mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/admin/contacts/${mockContact.id}/status`)
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ status: 'TRAITE' });

    expect(response.status).toBe(404);
  });

  it('should return 400 when status is invalid', async () => {
    const response = await request(app)
      .patch(`/api/admin/contacts/${mockContact.id}/status`)
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ status: 'STATUT_INEXISTANT' });

    expect(response.status).toBe(400);
  });
});

// ── DELETE /api/admin/contacts/:id ───────────────────

describe('DELETE /api/admin/contacts/:id', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 204 on successful soft delete', async () => {
    vi.spyOn(prisma.contact, 'findFirst').mockResolvedValue(mockContact);
    vi.spyOn(prisma.contact, 'update').mockResolvedValue({
      ...mockContact,
      deletedAt: new Date(),
    });

    const response = await request(app)
      .delete(`/api/admin/contacts/${mockContact.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(204);
  });

  it('should return 404 when contact does not exist', async () => {
    vi.spyOn(prisma.contact, 'findFirst').mockResolvedValue(null);

    const response = await request(app)
      .delete(`/api/admin/contacts/${mockContact.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(404);
  });
});
