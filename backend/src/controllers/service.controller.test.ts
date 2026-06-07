import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../models/client.js';

const mockServices = [
    {
        id: '1',
        title: 'Audit SEO',
        description: 'Audit complet',
        iconUrl: null,
        price: 500 as any,
        order: 1,
        isActive: true,
        createdAt: new Date(),
        deletedAt: null,
    },
    {
        id: '2',
        title: 'Création site',
        description: 'Site vitrine',
        iconUrl: null,
        price: 1200 as any,
        order: 2,
        isActive: true,
        createdAt: new Date(),
        deletedAt: null,
    },
];

describe('GET /api/services', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should return 200 with list of services', async () => {
        // ARRANGE
        vi.spyOn(prisma.service, 'findMany').mockResolvedValue(mockServices);

        // ACT
        const response = await request(app).get('/api/services');

        // ASSERT
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].title).toBe('Audit SEO');
    });

    it('should return 200 with empty array when no services exist', async () => {
        vi.spyOn(prisma.service, 'findMany').mockResolvedValue([]);

        const response = await request(app).get('/api/services');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should return 500 when database fails', async () => {
        vi.spyOn(prisma.service, 'findMany').mockRejectedValue(
            new Error('DB error')
        );

        const response = await request(app).get('/api/services');

        expect(response.status).toBe(500);
    });
});