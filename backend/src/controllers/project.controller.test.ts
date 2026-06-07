import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../models/client.js';

const mockProject = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Site vitrine Boulangerie',
    createdBy: 'admin-uuid-placeholder',
    summary: 'Site pour une boulangerie artisanale',
    year: 2024,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};

describe('GET /api/projects', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should return 200 with published projects', async () => {
        vi.spyOn(prisma.project, 'findMany').mockResolvedValue([mockProject]);

        const response = await request(app).get('/api/projects');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    it('should return 200 with empty array when no projects', async () => {
        vi.spyOn(prisma.project, 'findMany').mockResolvedValue([]);

        const response = await request(app).get('/api/projects');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should return 500 when database fails', async () => {
        vi.spyOn(prisma.project, 'findMany').mockRejectedValue(
            new Error('DB error')
        );

        const response = await request(app).get('/api/projects');

        expect(response.status).toBe(500);
    });
});

describe('GET /api/projects/:id', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should return 200 when project exists', async () => {
        vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(mockProject);

        const response = await request(app).get(
            `/api/projects/${mockProject.id}`
        );

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Site vitrine Boulangerie');
    });

    it('should return 404 when project does not exist', async () => {
        vi.spyOn(prisma.project, 'findFirst').mockResolvedValue(null);

        const response = await request(app).get(
            '/api/projects/550e8400-e29b-41d4-a716-446655440001'
        );

        expect(response.status).toBe(404);
    });

    it('should return 400 when id is not a valid UUID', async () => {
        const response = await request(app).get('/api/projects/not-a-uuid');

        expect(response.status).toBe(400);
    });
});