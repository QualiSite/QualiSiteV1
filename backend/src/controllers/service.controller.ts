import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../models/client.js';

export async function getServices(req: Request, res: Response, next: NextFunction) {
    try {
        const services = await prisma.service.findMany({
            where: {
                isActive: true,
                deletedAt: null,
            },
            orderBy: { order: 'asc' },
            select: {
                id: true,
                title: true,
                description: true,
                iconUrl: true,
                price: true,
            },
        });

        res.json(services);
    } catch (error) {
        next(error);
    }
}