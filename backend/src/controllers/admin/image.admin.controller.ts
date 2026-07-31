import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../models/client.js';
import { NotFoundError } from '../../lib/errors.js';
import { processAndSaveImage } from '../../lib/upload.js';
import { config } from '../../config.js';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const paramsSchema = z.object({
  id: z.string().uuid('ID invalide'),
  imageId: z.string().uuid('ID invalide').optional(),
});

export async function uploadProjectImage(req: Request, res: Response) {
  const { id } = paramsSchema.parse(req.params);

  const project = await prisma.project.findFirst({ where: { id, deletedAt: null } });
  if (!project) throw new NotFoundError('Projet introuvable');

  if (!req.file) throw new Error('Aucun fichier reçu');

  const filename = randomUUID();
  const savedFile = await processAndSaveImage(req.file.buffer, filename);
  const imageUrl = `${config.uploadUrl}/${savedFile}`;

  const image = await prisma.image.create({
    data: { imageUrl, altText: req.body.altText ?? null },
  });

  // Est-ce la première image ? Si oui, on la met en couverture automatiquement
  const existingCount = await prisma.projectImage.count({ where: { projectId: id } });

  const projectImage = await prisma.projectImage.create({
    data: {
      projectId: id,
      imageId: image.id,
      isCover: existingCount === 0,
    },
  });

  res.status(201).json({ ...image, isCover: projectImage.isCover });
}

export async function setCoverImage(req: Request, res: Response) {
  const { id, imageId } = paramsSchema.parse(req.params);

  const existing = await prisma.projectImage.findUnique({
    where: { projectId_imageId: { projectId: id, imageId: imageId! } },
  });
  if (!existing) throw new NotFoundError('Image introuvable pour ce projet');

  // Retire isCover de toutes les images du projet, puis le met sur celle-ci
  await prisma.$transaction([
    prisma.projectImage.updateMany({
      where: { projectId: id },
      data: { isCover: false },
    }),
    prisma.projectImage.update({
      where: { projectId_imageId: { projectId: id, imageId: imageId! } },
      data: { isCover: true },
    }),
  ]);

  res.json({ message: 'Image de couverture mise à jour' });
}

export async function deleteProjectImage(req: Request, res: Response) {
  const { id, imageId } = paramsSchema.parse(req.params);

  const projectImage = await prisma.projectImage.findUnique({
    where: { projectId_imageId: { projectId: id, imageId: imageId! } },
    include: { image: true },
  });
  if (!projectImage) throw new NotFoundError('Image introuvable pour ce projet');

  // Supprime le fichier physique
  const filename = path.basename(projectImage.image.imageUrl);
  const filepath = path.resolve('uploads', filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  // Supprime en base (ProjectImage d'abord, puis Image)
  await prisma.projectImage.delete({
    where: { projectId_imageId: { projectId: id, imageId: imageId! } },
  });
  await prisma.image.delete({ where: { id: imageId! } });

  res.status(204).end();
}
