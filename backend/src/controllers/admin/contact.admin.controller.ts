import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../models/client.js';
import { NotFoundError } from '../../lib/errors.js';
import { ContactStatus } from '../../../generated/prisma/client.js';
import { sendAdminReply } from '../../lib/mailer.js';

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

const replySchema = z.object({
  messageText: z.string().min(1, 'Le message ne peut pas être vide'),
});

export async function getAdminContacts(req: Request, res: Response) {
  const contacts = await prisma.contact.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  res.json(contacts);
}

export async function getAdminContactById(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);

  const contact = await prisma.contact.findFirst({
    where: { id, deletedAt: null },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!contact) throw new NotFoundError('Contact introuvable');

  res.json(contact);
}

export async function updateContactStatus(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);
  const { status } = updateStatusSchema.parse(req.body);

  const existing = await prisma.contact.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError('Contact introuvable');

  const contact = await prisma.contact.update({ where: { id }, data: { status } });
  res.json({ id: contact.id, status: contact.status });
}

export async function replyToContact(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);
  const { messageText } = replySchema.parse(req.body);

  const contact = await prisma.contact.findFirst({ where: { id, deletedAt: null } });
  if (!contact) throw new NotFoundError('Contact introuvable');

  const admin = await prisma.user.findUnique({ where: { id: req.user!.userId } });

  const message = await prisma.message.create({
    data: {
      contactId: id,
      messageText,
      senderEmail: admin!.email,
    },
  });

  await sendAdminReply(contact.email, contact.name, messageText);

  res.status(201).json(message);
}

export async function deleteContact(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);

  const contact = await prisma.contact.findFirst({ where: { id, deletedAt: null } });
  if (!contact) throw new NotFoundError('Contact introuvable');

  await prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } });
  res.status(204).end();
}
