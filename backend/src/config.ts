// ── Sprint 1 — Variables requises dès maintenant ──

if (!process.env.ALLOWED_ORIGINS) {
    throw new Error('ALLOWED_ORIGINS environment variable is required');
}

// ── Sprint 2 — Décommenter quand on attaque l'auth ─

// if (!process.env.JWT_SECRET) {
//     throw new Error('JWT_SECRET environment variable is required');
// }
// if (!process.env.JWT_ACCESS_EXPIRES_IN || Number.isNaN(Number(process.env.JWT_ACCESS_EXPIRES_IN))) {
//     throw new Error('JWT_ACCESS_EXPIRES_IN environment variable is required and must be a valid number');
// }
// if (!process.env.JWT_REFRESH_EXPIRES_IN || Number.isNaN(Number(process.env.JWT_REFRESH_EXPIRES_IN))) {
//     throw new Error('JWT_REFRESH_EXPIRES_IN environment variable is required and must be a valid number');
// }

// ── Sprint 3 — Décommenter quand on attaque les emails ─

// if (!process.env.RESEND_API_KEY) {
//     throw new Error('RESEND_API_KEY environment variable is required');
// }
// if (!process.env.RESEND_EMAIL) {
//     throw new Error('RESEND_EMAIL environment variable is required');
// }

export const config = {
    // Serveur
    port: parseInt(process.env.PORT ?? '3000'),
    isProd: process.env.NODE_ENV === 'production',

    // CORS — chaîne séparée par des virgules → tableau
    // ex: ALLOWED_ORIGINS=http://localhost:5173,https://qualisite.fr
    allowedOrigins: process.env.ALLOWED_ORIGINS!.split(','),

    // Sprint 2 — Auth
    // jwtSecret: process.env.JWT_SECRET!,
    // jwtAccessExpiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN),
    // jwtRefreshExpiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),

    // Sprint 3 — Emails
    // resendApiKey: process.env.RESEND_API_KEY!,
    // resendEmail: process.env.RESEND_EMAIL!,
};