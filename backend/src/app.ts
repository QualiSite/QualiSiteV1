import express from 'express';
import cors from 'cors';
import { xss } from 'express-xss-sanitizer';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { globalErrorHandler } from './middlewares/global-error-handler.js';
import { config } from './config.js';




// ── Routers ───────────────────────────────────────
// Sprint 1
import contactRouter from './routers/contact.router.js';
// Sprint 2
import authRouter from './routers/auth.router.js';
import projectRouter from './routers/project.router.js';
import serviceRouter from './routers/service.router.js';
// Admin
import projectAdminRouter from './routers/admin/project.admin.router.js';
import serviceAdminRouter from './routers/admin/service.admin.router.js';
import contactAdminRouter from './routers/admin/contact.admin.router.js';



// import userRouter from './routers/user.router.js';
// import leadRouter from './routers/lead.router.js';
// Sprint 3
// import invoiceRouter from './routers/invoice.router.js';
// import clientRouter from './routers/client.router.js';



const app = express();

app.set('trust proxy', 1);

// ── Rate limiting ─────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Trop de requêtes, veuillez réessayer plus tard.' },
});

// ── CORS ──────────────────────────────────────────
const corsOptions = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        if (!origin) return callback(null, true);
        if (config.allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

// ── Middlewares globaux ───────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(xss());
app.use(globalLimiter);

// ── Fichiers statiques (uploads images portfolio) ─
app.use('/uploads', express.static('uploads'));

// ── Routes ────────────────────────────────────────
// Sprint 1
app.use('/api', contactRouter);
// Sprint 2
app.use('/auth', authRouter);
app.use('/api', projectRouter);
app.use('/api', serviceRouter);
// app.use('/api', userRouter);
// app.use('/api', leadRouter);
// Sprint 3
// app.use('/api', invoiceRouter);
// app.use('/api', clientRouter);

// Sprint 2 — Admin
app.use('/api/admin/projects', projectAdminRouter);
app.use('/api/admin/services', serviceAdminRouter);
app.use('/api/admin/contacts', contactAdminRouter);

// ── Health check ──────────────────────────────────
app.get('/', (_req, res) => {
    res.json({ message: 'QualiSite API — opérationnelle' });
});

// ── Gestionnaire d'erreurs global ─────────────────
app.use(globalErrorHandler);

export default app;