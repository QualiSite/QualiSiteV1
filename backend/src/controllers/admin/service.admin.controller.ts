import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../models/client.js';
import { NotFoundError } from '../../lib/errors.js';

const paramsSchema = z.object({
    id: z.string().uuid('ID invalide'),
});

const createServiceSchema = z.object({
    title:       z.string().min(1),
    description: z.string().optional(),
    iconUrl:     z.string().url().optional(),
    price:       z.number().positive(),
    order:       z.number().int().min(0).optional(),
});

const updateServiceSchema = createServiceSchema.partial();

export async function getAdminServices(req: Request, res: Response) {
    const services = await prisma.service.findMany({
        where:   { deletedAt: null },
        orderBy: { order: 'asc' },
    });
    res.json(services);
}

export async function createService(req: Request, res: Response) {
    const { title, description, iconUrl, price, order } = createServiceSchema.parse(req.body);

    const service = await prisma.service.create({
        data: { title, description: description ?? null, iconUrl: iconUrl ?? null, price, order: order ?? 0 },
    });
    res.status(201).json(service);
}

export async function updateService(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const data   = updateServiceSchema.parse(req.body);

    const existing = await prisma.service.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Service introuvable');

    const service = await prisma.service.update({
        where: { id },
        data: {
            ...(data.title       !== undefined && { title:       data.title }),
            ...(data.description !== undefined && { description: data.description ?? null }),
            ...(data.iconUrl     !== undefined && { iconUrl:     data.iconUrl     ?? null }),
            ...(data.price       !== undefined && { price:       data.price }),
            ...(data.order       !== undefined && { order:       data.order }),
        },
    });
    res.json(service);
}

export async function deleteService(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);

    const existing = await prisma.service.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Service introuvable');

    await prisma.service.update({ where: { id }, data: { deletedAt: new Date() } });
    res.status(204).end();
}