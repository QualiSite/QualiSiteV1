import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../models/client.js';
import { ContactStatus } from '../../generated/prisma/client.js';

const validBody = {
  name: 'Jean Dupont',
  email: 'jean@example.com',
  subject: 'Demande de devis',
  initialMessage: 'Bonjour, je souhaite un devis.',
};

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 201 when contact is valid', async () => {
    // ARRANGE — mock les deux créations BDD
    vi.spyOn(prisma.contact, 'create').mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Jean Dupont',
      email: 'jean@example.com',
      subject: 'Demande de devis',
      initialMessage: 'Bonjour, je souhaite un devis.',
      status: ContactStatus as any,
      createdAt: new Date(),
      deletedAt: null,
    });
    vi.spyOn(prisma.message, 'create').mockResolvedValue({} as any);

    // ACT
    const response = await request(app).post('/api/contact').send(validBody);

    // ASSERT
    expect(response.status).toBe(201);
  });

  it('should return 400 when email is invalid', async () => {
    const response = await request(app)
      .post('/api/contact')
      .send({ ...validBody, email: 'not-an-email' });

    expect(response.status).toBe(400);
  });

  it('should return 400 when required fields are missing', async () => {
    const response = await request(app).post('/api/contact').send({ email: 'jean@example.com' });

    expect(response.status).toBe(400);
  });

  it('should return 500 when database fails', async () => {
    vi.spyOn(prisma.contact, 'create').mockRejectedValue(new Error('DB error'));

    const response = await request(app).post('/api/contact').send(validBody);

    expect(response.status).toBe(500);
  });
});
