import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../models/client.js';
import { NotFoundError } from '../../lib/errors.js';
import { ContactStatus } from '../../../generated/prisma/client.js';

const paramsSchema = z.object({
    id: z.string().uuid('ID invalide'),
});

const updateStatusSchema = z.object({
    status: z.enum([
        ContactStatus.NOUVEAU,
        ContactStatus.TRAITE,
        ContactStatus.ARCHIVE,
        ContactStatus.CLIENT,
    ]),
});

export async function getAdminContacts(req: Request, res: Response) {
    const contacts = await prisma.contact.findMany({
        where:   { deletedAt: null },
        orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
}

export async function getAdminContactById(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);

    const contact = await prisma.contact.findFirst({
        where:   { id, deletedAt: null },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!contact) throw new NotFoundError('Contact introuvable');

    res.json(contact);
}

export async function updateContactStatus(req: Request, res: Response) {
    const { id }     = paramsSchema.parse(req.params);
    const { status } = updateStatusSchema.parse(req.body);

    const existing = await prisma.contact.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Contact introuvable');

    const contact = await prisma.contact.update({ where: { id }, data: { status } });
    res.json({ id: contact.id, status: contact.status });
}