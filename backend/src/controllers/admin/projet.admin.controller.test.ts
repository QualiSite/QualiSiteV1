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

const mockProject = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'Site vitrine Boulangerie',
  summary: 'Un beau site',
  year: 2024,
  isPublished: false,
  createdBy: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// ── POST /api/admin/projects ──────────────────────────

describe('POST /api/admin/projects', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 201 on valid project creation', async () => {
    vi.spyOn(prisma.project, 'create').mockResolvedValue(mockProject);

    const response = await request(app)
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ title: 'Site vitrine Boulangerie', summary: 'Un beau site', year: 2024 });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Site vitrine Boulangerie');
  });

  it('should return 400 when title is missing', async () => {
    const response = await request(app)
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ summary: 'Sans titre' });

    expect(response.status).toBe(400);
  });
});

// ── PATCH /api/admin/projects/:id ────────────────────

describe('PATCH /api/admin/projects/:id', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 200 on successful update', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(mockProject);
    vi.spyOn(prisma.project, 'update').mockResolvedValue({
      ...mockProject,
      title: 'Nouveau titre',
    });

    const response = await request(app)
      .patch(`/api/admin/projects/${mockProject.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ title: 'Nouveau titre' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Nouveau titre');
  });

  it('should return 404 when project does not exist', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/admin/projects/${mockProject.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ title: 'Nouveau titre' });

    expect(response.status).toBe(404);
  });
});

// ── PATCH /api/admin/projects/:id/publish ────────────

describe('PATCH /api/admin/projects/:id/publish', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should toggle isPublished to true', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(mockProject); // isPublished: false
    vi.spyOn(prisma.project, 'update').mockResolvedValue({
      ...mockProject,
      isPublished: true,
    });

    const response = await request(app)
      .patch(`/api/admin/projects/${mockProject.id}/publish`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.isPublished).toBe(true);
  });

  it('should return 404 when project does not exist', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/admin/projects/${mockProject.id}/publish`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(404);
  });
});

// ── DELETE /api/admin/projects/:id ───────────────────

describe('DELETE /api/admin/projects/:id', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 204 on successful soft delete', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(mockProject);
    vi.spyOn(prisma.project, 'update').mockResolvedValue({
      ...mockProject,
      deletedAt: new Date(),
    });

    const response = await request(app)
      .delete(`/api/admin/projects/${mockProject.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(204);
  });

  it('should return 404 when project does not exist', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

    const response = await request(app)
      .delete(`/api/admin/projects/${mockProject.id}`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(404);
  });
});
