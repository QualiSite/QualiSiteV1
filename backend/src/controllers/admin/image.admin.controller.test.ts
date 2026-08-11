import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import { prisma } from '../../models/client.js';
import * as uploadLib from '../../lib/upload.js';

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

const mockImage = {
  id: '550e8400-e29b-41d4-a716-446655440005',
  imageUrl: 'http://localhost:3001/uploads/some-uuid.webp',
  altText: null,
  createdAt: new Date(),
};

// ── POST /api/admin/projects/:id/images ───────────────

describe('POST /api/admin/projects/:id/images', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should return 201 when an image is uploaded successfully', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(mockProject);
    vi.spyOn(uploadLib, 'processAndSaveImage').mockResolvedValue('some-uuid.webp');
    vi.spyOn(prisma.image, 'create').mockResolvedValue(mockImage);
    vi.spyOn(prisma.projectImage, 'count').mockResolvedValue(0);
    vi.spyOn(prisma.projectImage, 'create').mockResolvedValue({
      projectId: mockProject.id,
      imageId: mockImage.id,
      isCover: true,
      order: 0,
      createdAt: new Date(),
    });

    const response = await request(app)
      .post(`/api/admin/projects/${mockProject.id}/images`)
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .attach('image', Buffer.from('fake-image-bytes'), 'photo.jpg');

    expect(response.status).toBe(201);
    expect(response.body.isCover).toBe(true);
  });

  it('should return 400 when no file is provided', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(mockProject);

    const response = await request(app)
      .post(`/api/admin/projects/${mockProject.id}/images`)
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(response.status).toBe(400);
  });

  it('should return 404 when the project does not exist', async () => {
    vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

    const response = await request(app)
      .post(`/api/admin/projects/${mockProject.id}/images`)
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .attach('image', Buffer.from('fake-image-bytes'), 'photo.jpg');

    expect(response.status).toBe(404);
  });
});
