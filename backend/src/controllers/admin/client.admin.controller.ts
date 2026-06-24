import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../models/client.js';
import { NotFoundError } from '../../lib/errors.js';

const paramsSchema = z.object({
  id: z.string().uuid('ID invalide'),
});

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  siret: z.string().optional(),
  companyName: z.string().optional(),
});

const updateClientSchema = clientSchema.partial();

export async function getAdminClients(req: Request, res: Response) {
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  res.json(clients);
}

export async function getAdminClientById(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);

  const client = await prisma.client.findFirst({
    where: { id, deletedAt: null },
    include: { invoices: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } } },
  });
  if (!client) throw new NotFoundError('Client introuvable');

  res.json(client);
}

export async function createClient(req: Request, res: Response) {
  const data = clientSchema.parse(req.body);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: '',
      role: 'CLIENT',
      isActive: false,
    },
  });

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name: data.name,
      email: data.email,
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.siret !== undefined && { siret: data.siret }),
      ...(data.companyName !== undefined && { companyName: data.companyName }),
    },
  });

  res.status(201).json(client);
}

export async function updateClient(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);
  const data = updateClientSchema.parse(req.body);

  const existing = await prisma.client.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError('Client introuvable');

  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.siret !== undefined && { siret: data.siret }),
      ...(data.companyName !== undefined && { companyName: data.companyName }),
    },
  });

  res.json(client);
}

export async function deleteClient(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);

  const existing = await prisma.client.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError('Client introuvable');

  await prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
  res.status(204).end();
}
