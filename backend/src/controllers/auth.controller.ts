import type { Request, Response } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../models/client.js';
import { UserRole } from '../../generated/prisma/client.js';

import { config } from '../config.js';
import { generateAuthTokens } from '../lib/token.js';
import { sendVerificationEmail } from '../lib/mailer.js';
import {
    BadRequestError,
    ConflictError,
    UnauthorizedError,
} from '../lib/errors.js';
import type { User } from '../../generated/prisma/client.js';

// ── Helpers ───────────────────────────────────────

function setRefreshTokenCookie(res: Response, token: string, expiresIn: number) {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure:   config.isProd,
        sameSite: config.isProd ? 'none' : 'lax',
        maxAge:   expiresIn,
        path:     '/auth/refresh',
    });
}

async function rotateRefreshToken(user: User, token: string) {
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.refreshToken.create({
        data: { token, userId: user.id },
    });
}

// ── Register ──────────────────────────────────────

export async function registerUser(req: Request, res: Response) {
    const schema = z.object({
        email:           z.email(),
        password:        z.string().min(8).max(100)
                          .regex(/[a-z]/)
                          .regex(/[A-Z]/)
                          .regex(/[!@#$%&.*\-+{}?]/),
        confirmPassword: z.string(),
    });

    const { email, password, confirmPassword } = schema.parse(req.body);

    if (password !== confirmPassword) {
        throw new BadRequestError('Mot de passe et confirmation ne correspondent pas');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new ConflictError('Cette adresse email est déjà utilisée');
    }

    const passwordHash = await argon2.hash(password);
    const verifyToken  = crypto.randomBytes(32).toString('hex');

    await prisma.user.create({
        data: {
            email,
            passwordHash,
            verifyToken,
            isActive: false,
            role: UserRole.CLIENT, 
        },
    });

    await sendVerificationEmail(email, verifyToken);

    res.status(201).json({
        message: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
    });
}

// ── Verify email ──────────────────────────────────

export async function verifyEmail(req: Request, res: Response) {
    const { token } = req.query as { token: string };

    const user = await prisma.user.findFirst({ where: { verifyToken: token } });
    if (!user) {
        throw new BadRequestError('Lien de vérification invalide ou expiré');
    }

    await prisma.user.update({
        where: { id: user.id },
        data:  { isActive: true, verifyToken: null },
    });

    res.json({ message: 'Compte activé avec succès !' });
}

// ── Login ─────────────────────────────────────────

export async function loginUser(req: Request, res: Response) {
    const schema = z.object({
        email:    z.email(),
        password: z.string(),
    });

    const { email, password } = schema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
        throw new UnauthorizedError('Confirmez votre email avant de vous connecter');
    }

    const isMatching = await argon2.verify(user.passwordHash, password);
    if (!isMatching) {
        throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    const { accessToken, refreshToken } = generateAuthTokens(user);

    await rotateRefreshToken(user, refreshToken.token);
    setRefreshTokenCookie(res, refreshToken.token, refreshToken.expiresIn);

    res.json({
        accessToken: accessToken.token,
        user: { id: user.id, email: user.email, role: user.role },
    });
}

// ── Refresh ───────────────────────────────────────

export async function refreshAccessToken(req: Request, res: Response) {
    const receivedToken = req.cookies.refreshToken as string | undefined;
    if (!receivedToken) {
        throw new UnauthorizedError('Token de rafraîchissement manquant');
    }

    try {
        jwt.verify(receivedToken, config.jwtSecret, { audience: 'refresh' });
    } catch {
        throw new UnauthorizedError('Token de rafraîchissement invalide');
    }

    const stored = await prisma.refreshToken.findUnique({
        where:   { token: receivedToken },
        include: { user: true },
    });

    if (!stored) {
        throw new UnauthorizedError('Token de rafraîchissement introuvable');
    }

    const { accessToken, refreshToken } = generateAuthTokens(stored.user);

    await rotateRefreshToken(stored.user, refreshToken.token);
    setRefreshTokenCookie(res, refreshToken.token, refreshToken.expiresIn);

    res.json({
        accessToken: accessToken.token,
        user: { id: stored.user.id, email: stored.user.email, role: stored.user.role },
    });
}

// ── Me ────────────────────────────────────────────

export async function getMe(req: Request, res: Response) {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
        throw new UnauthorizedError('Utilisateur introuvable');
    }

    res.json({ id: user.id, email: user.email, role: user.role, createdAt: user.createdAt });
}

// ── Logout ────────────────────────────────────────

export async function logoutUser(req: Request, res: Response) {
    res.clearCookie('refreshToken', { path: '/auth/refresh' });

    if (req.user) {
        await prisma.refreshToken.deleteMany({ where: { userId: req.user.userId } });
    }

    res.status(204).end();
}