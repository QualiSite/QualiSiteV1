import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import type { Request } from 'express';

const UPLOADS_DIR = path.resolve('uploads');

// Crée le dossier uploads s'il n'existe pas
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer stocke le fichier en mémoire avant que sharp le traite
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
  fileFilter: (_req: Request, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez JPEG, PNG ou WebP.'));
    }
  },
});

// Traite et sauvegarde l'image avec sharp
export async function processAndSaveImage(buffer: Buffer, filename: string): Promise<string> {
  const outputFilename = `${filename}.webp`;
  const outputPath = path.join(UPLOADS_DIR, outputFilename);

  await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return outputFilename;
}
