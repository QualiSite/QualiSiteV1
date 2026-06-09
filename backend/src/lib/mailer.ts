import { Resend } from 'resend';
import { config } from '../config.js';

const resend = new Resend(config.resendApiKey);
const frontendUrl = config.allowedOrigins[0];

export async function sendVerificationEmail(email: string, token: string) {
    await resend.emails.send({
        from:    config.resendEmail,
        to:      email,
        subject: 'Confirmez votre inscription sur QualiSite',
        html: `
            <h2>Bienvenue sur QualiSite !</h2>
            <p>Cliquez sur ce lien pour confirmer votre compte :</p>
            <a href="${frontendUrl}/verify-email?token=${token}">
                Confirmer mon compte
            </a>
            <p>Ce lien est valable 24h.</p>
        `,
    });
}