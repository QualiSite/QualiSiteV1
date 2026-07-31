import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../models/client.js';
import { NotFoundError } from '../lib/errors.js';
import { z } from 'zod';

export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        year: true,
        images: {
          where: { isCover: true },
          select: {
            image: {
              select: {
                imageUrl: true,
                altText: true,
              },
            },
          },
        },
        services: {
          select: {
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req: Request, res: Response, next: NextFunction) {
  try {
    const paramsSchema = z.object({
      id: z.string().uuid('ID invalide'),
    });

    const { id } = paramsSchema.parse(req.params);

    const project = await prisma.project.findFirst({
      where: {
        id,
        isPublished: true,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        year: true,
        images: {
          select: {
            isCover: true,
            order: true,
            image: {
              select: {
                imageUrl: true,
                altText: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        services: {
          select: {
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!project) throw new NotFoundError('Projet introuvable');

    res.json(project);
  } catch (error) {
    next(error);
  }
}
