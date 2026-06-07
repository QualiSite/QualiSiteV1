import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../models/client.js';
import logger from '../lib/logger.js';

describe('globalErrorHandler', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should return 500 when an unexpected error occurs', async () => {
        // ARRANGE
        vi.spyOn(prisma.project, 'findMany').mockRejectedValue(
            new Error('Database error')
        );
        vi.spyOn(logger, 'error').mockImplementation(() => {});

        // ACT
        const response = await request(app).get('/api/projects');

        // ASSERT
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });

    it('should return 400 with details when ZodError is thrown', async () => {
        // ACT — email invalide déclenche ZodError dans le controller
        const response = await request(app)
            .post('/api/contact')
            .send({ email: 'not-an-email', message: 'test' });

        // ASSERT
        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    it('should return 404 when NotFoundError is thrown', async () => {
        // ARRANGE — projet introuvable
        vi.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

        // ACT
        const validUUID = '550e8400-e29b-41d4-a716-446655440000';
        const response = await request(app).get(`/api/projects/${validUUID}`);

        // ASSERT
        expect(response.status).toBe(404);
    });
});