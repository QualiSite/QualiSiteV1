import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../models/client.js';
import { NotFoundError } from '../../lib/errors.js';

const paramsSchema = z.object({
  id: z.string().uuid('ID invalide'),
});

const createProjectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
});

const updateProjectSchema = createProjectSchema.partial();

export async function getAdminProjects(req: Request, res: Response) {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { images: { include: { image: true } }, services: true },
  });
  res.json(projects);
}

export async function createProject(req: Request, res: Response) {
  const { title, summary, year } = createProjectSchema.parse(req.body);

  const project = await prisma.project.create({
    data: {
      title,
      summary: summary ?? null,
      year: year ?? null,
      createdBy: req.user!.userId,
    },
  });
  res.status(201).json(project);
}

export async function updateProject(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);
  const data = updateProjectSchema.parse(req.body);

  const existing = await prisma.project.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError('Projet introuvable');

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.summary !== undefined && { summary: data.summary ?? null }),
      ...(data.year !== undefined && { year: data.year ?? null }),
    },
  });

  res.json(project);
}

export async function deleteProject(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);

  const existing = await prisma.project.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError('Projet introuvable');

  await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  res.status(204).end();
}

export async function togglePublish(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);

  const existing = await prisma.project.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError('Projet introuvable');

  const project = await prisma.project.update({
    where: { id },
    data: { isPublished: !existing.isPublished },
  });
  res.json({ id: project.id, isPublished: project.isPublished });
}
