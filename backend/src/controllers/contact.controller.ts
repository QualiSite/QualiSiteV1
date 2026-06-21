import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../models/client.js';
import { sendConfirmationEmail } from '../lib/mailer.js';

// ── Schéma de validation ──────────────────────────
const contactSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.email('Email invalide'),
    subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères'),
    initialMessage: z.string().min(20, 'Le message doit contenir au moins 20 caractères'),
});

// ── Controller ────────────────────────────────────
export async function createContact(req: Request, res: Response, next: NextFunction) {
    try {
        const data = contactSchema.parse(req.body);

        const contact = await prisma.contact.create({
            data: {
                name: data.name,
                email: data.email,
                subject: data.subject,
                initialMessage: data.initialMessage,
            },
            
        });

        await sendConfirmationEmail(contact.email, contact.name);

        res.status(201).json({
            message: 'Votre demande a bien été envoyée.',
            contactId: contact.id,
        });
    } catch (error) {
        next(error);
    }
}